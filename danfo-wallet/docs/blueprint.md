# Danfo Wallet Technical Blueprint

Danfo Wallet is a secure, offline-first travel companion that keeps passports, travel tickets, reservations, and payment cards in an encrypted mobile vault while providing proactive reminders for expiries and trip milestones. This document outlines the end-to-end blueprint spanning architecture, storage, rendering, security, and future cloud integrations.

---

## 1. System Architecture Overview

- **Platforms**: Native mobile (Android, iOS) via React Native/Expo shell with native modules for biometrics, encryption, OCR, and rendering.
- **Execution model**: Offline-first; all document rendering, extraction, and encryption happen locally. Optional encrypted cloud backup uses zero-knowledge packaging.
- **Core subsystems**:
  - Capture & Extraction (camera, files, email ingestion)
  - Template Rendering (passport, ticket, payment card)
  - Secure Vault (SQLCipher/Encrypted FS + biometric gating)
  - Timeline & Reminders (local notifications, calendar sync)
  - Optional Sync (encrypted blob upload/download)

> PlantUML source: `docs/architecture.puml`

```
@startuml
!include architecture.puml
@enduml
```

---

## 2. Module Breakdown

### 2.1 Template Rendering
- **Inputs**: Parsed document metadata, cropped user photo, extracted QR/MRZ strings.
- **Pipeline**:
  1. Load template definition (PNG/SVG/gradient recipe or Jetpack Compose/SwiftUI canvas instructions).
  2. Compose dynamic layers (brand colors, traveler names, itinerary data).
  3. Render QR/MRZ overlays.
  4. Export to bitmap, encrypt (`AES-256`), persist encrypted payload + preview thumb.
- **Implementation options**:
  - Cross-platform: React Native + Skia (`@shopify/react-native-skia`) — see `src/modules/rendering/templates.ts`.
  - Android native: Jetpack Compose `Canvas`, `android.graphics.pdf.PdfRenderer` for PDFs.
  - iOS native: CoreGraphics/SwiftUI `Canvas`, `PDFKit` for ticket PDFs.

```64:133:src/modules/rendering/templates.ts
export const renderPassportTemplate = async (
  document: WalletDocument,
  options: RenderOptions,
): Promise<RenderResult> => {
  const { canvas, recorder, width, height } = createCanvas(1080, 1620);
  // ... stylized layers, MRZ zone, watermark ...
  const { encryptedUri, previewDataUri } = await renderToEncryptedPng(
    recorder,
    options.outputName,
    options.keyAlias,
  );
  return {
    encryptedUri,
    previewDataUri,
    metadata: {
      type: 'passport',
      documentId: document.id,
      traveler: document.traveler,
    },
  };
};
```

### 2.2 Card Storage & Verification
- **Acquisition**: Manual entry or NFC/scan via `react-native-cardscan` or custom camera OCR (bin/bin).
- **Verification** (choose per issuer capability):
  - OTP via issuer API/webhook.
  - Micro-charge confirmation (reverse charge after verification).
  - 3D Secure redirect inside `WebView` (Verified by Visa/Mastercard SecureCode).
- **Storage policy**:
  - Last 4 + expiry stored locally in encrypted SQLCipher table.
  - PAN tokenized via PCI-compliant vault (Stripe Issuing, Marqeta, Paystack Token).
  - Biometric/PIN guard required before revealing card artifact or initiating tokenized payments.

### 2.3 Ticket & Reservation Handling
- **Upload flows**: Camera (JPEG/PNG), file picker (PDF), email forwarding to app alias.
- **Extraction**:
  - OCR: Google ML Kit (on-device) or Tesseract for offline heavy lifting.
  - Barcode/MRZ: ZXing for QR/Aztec, `binlist` for MRZ.
  - PDF parsing: `react-native-pdf-lib` or native PDFKit/PdfRenderer.
- **Presentation**: Use `renderTicketTemplate` for stylized airline/hotel passes; store original asset encrypted for compliance.
- **Future automations**: OAuth with airlines (Amadeus, Sabre), Gmail/Outlook add-ins, push updates when airline status changes.

### 2.4 Security Architecture
- **Encryption**: AES-256-CBC with random IV per payload using secure device-kept keys.
- **Key storage**: iOS Keychain (`kSecAttrAccessibleWhenUnlockedThisDeviceOnly`), Android Keystore + `EncryptedSharedPreferences` fallback.
- **Vault**: SQLCipher DB for metadata + encrypted binary column; fallback to encrypted file blobs for large documents.
- **Authentication**: Device biometrics (`LocalAuthentication`), passcode fallback, inactivity timeouts.
- **Auditing**: Append-only local log of sensitive actions (view, export, share) using hashed entries.

```70:118:src/utils/encryption.ts
export const encryptBytes = async (
  plaintext: Uint8Array,
  context: EncryptionContext = {},
): Promise<string> => {
  const keyAlias = context.keyAlias ?? DEFAULT_KEY_ALIAS;
  const base64Key = await ensureVaultKey(keyAlias);
  const key = CryptoJS.enc.Base64.parse(base64Key);
  const iv = CryptoJS.lib.WordArray.random(IV_SIZE_BYTES);
  const encrypted = CryptoJS.AES.encrypt(uint8ArrayToWordArray(plaintext), key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const payload = concatIvAndCiphertext(iv, encrypted.ciphertext);
  return CryptoJS.enc.Base64.stringify(payload);
};
```

### 2.5 Offline-First + Cloud Backup
- By default, all assets live only on-device; no network access needed after dependencies load.
- Optional backup uses encrypted bundles (`vault` + metadata manifest) uploaded via background sync when Wi-Fi + charging.
- Restore requires biometric auth and passphrase derived key (PBKDF2) to decrypt cloud blob.

### 2.6 Reminders & Timeline
- Local schedule using `expo-notifications` (or native `AlarmManager`/`UNUserNotificationCenter`).
- Derive events from documents, reservations, reminders — see `WalletContext` reducer.
- Calendar integration optional (ICS export) but not default for privacy.

---

## 3. Data Models & Storage Schema

| Entity | Table (SQLCipher) | Key fields | Encrypted columns |
| ------ | ----------------- | ---------- | ----------------- |
| Passport & documents | `documents` | `id TEXT PRIMARY KEY`, `type`, `title`, `traveler`, `issued_at`, `expires_at` | `payload_blob` (encrypted PNG/PDF), `notes_enc` |
| Reservations | `reservations` | `id`, `type`, `title`, `provider`, `start_date`, `end_date`, `location` | `raw_ticket_blob`, `notes_enc` |
| Payment cards | `cards` | `id`, `brand`, `card_type`, `holder_name`, `last4`, `expiry_month`, `expiry_year` | `token_ref`, `card_art_blob` |
| Reminders | `reminders` | `id`, `title`, `due_date`, `priority`, `status` | `notes_enc` |
| Timeline | `timeline_events` | `id`, `category`, `date`, `related_id` | — (derived view) |

```sql
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  traveler TEXT NOT NULL,
  issued_at TEXT,
  expires_at TEXT,
  payload_blob BLOB NOT NULL,
  notes_enc BLOB,
  tags TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

- **Indexing**: Add indexes on `expires_at`, `start_date` for timeline queries.
- **Vault file layout**:
  - `/vault/meta.db` — SQLCipher metadata DB.
  - `/vault/blobs/<uuid>.danfo` — base64 AES payloads created by rendering pipeline.
  - `/vault/logs/audit.log` — append-only hashed log.

---

## 4. Example Workflows & Snippets

### 4.1 Template Rendering (Expo/Skia)
- Passport, ticket, card renderers live in `src/modules/rendering/templates.ts` (see excerpts above).
- Swap Skia for platform-native canvases by porting drawing commands to Jetpack Compose `Canvas` or SwiftUI `Canvas` while reusing same layout metrics.

### 4.2 Secure Local Encryption
- Utility functions in `src/utils/encryption.ts` provide AES encryption/decryption for byte buffers and JSON metadata.
- Ensure `text-encoding` polyfill is loaded before usage when running on React Native Hermes.

### 4.3 Biometric Authentication Flow (Kotlin)

```kotlin
class VaultUnlocker(private val context: FragmentActivity) {
    private val executor = ContextCompat.getMainExecutor(context)
    private val promptInfo = BiometricPrompt.PromptInfo.Builder()
        .setTitle("Unlock Danfo Vault")
        .setSubtitle("Authenticate to view secure documents")
        .setNegativeButtonText("Use PIN")
        .setConfirmationRequired(true)
        .build()

    fun authenticate(onSuccess: () -> Unit, onFallback: () -> Unit) {
        val biometricPrompt = BiometricPrompt(context, executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    onSuccess()
                }

                override fun onAuthenticationError(code: Int, errString: CharSequence) {
                    if (code == BiometricPrompt.ERROR_NEGATIVE_BUTTON) onFallback() else Unit
                }
            })
        biometricPrompt.authenticate(promptInfo)
    }
}
```

### 4.4 Biometric Authentication Flow (SwiftUI)

```swift
final class VaultUnlocker: NSObject {
    private let context = LAContext()

    func unlock(reason: String = "Access your Danfo Wallet", completion: @escaping (Bool, Error?) -> Void) {
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            completion(false, error)
            return
        }

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, err in
            DispatchQueue.main.async { completion(success, err) }
        }
    }
}
```

### 4.5 Card Ownership Verification (Pseudo Flow)

```
User scans card -> Extract BIN -> Hit issuer verification endpoint
    -> choose challenge type:
        * OTP: issuer sends code -> user enters -> verify -> activate token
        * Micro-charge: debit small amount -> user confirms amount -> refund -> activate token
        * 3DS: open web challenge -> success callback -> activate token
On success -> store token ref in cards.token_ref (encrypted)
On failure -> mark card as pending_verification with retry count
```

---

## 5. Mock Cloud Backup API Contract

```yaml
openapi: 3.1.0
info:
  title: Danfo Wallet Backup API
  version: 0.1.0
paths:
  /v1/vaults/{deviceId}/snapshots:
    post:
      summary: Upload encrypted vault snapshot
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/octet-stream:
            schema:
              type: string
              format: binary
      responses:
        '201':
          description: Snapshot stored
    get:
      summary: List available snapshots
      responses:
        '200':
          description: Snapshot list
          content:
            application/json:
              schema:
                type: object
                properties:
                  snapshots:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        createdAt:
                          type: string
                          format: date-time
                        sizeBytes:
                          type: integer
  /v1/vaults/{deviceId}/snapshots/{snapshotId}:
    get:
      summary: Download encrypted snapshot
      responses:
        '200':
          description: Binary payload
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary
    delete:
      summary: Delete snapshot
      responses:
        '204':
          description: Snapshot removed
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

- **Authentication**: Device-signed JWT (using secure enclave/keystore key). Optional user-level OAuth for multi-device sync.
- **Payload**: Already encrypted bundle; server stores without decryption capabilities.

---

## 6. Implementation Roadmap

1. **Foundations (Week 1)**
   - Finalize data models and SQLCipher migrations.
   - Integrate biometric authentication + vault unlock screens.
2. **Document Pipelines (Weeks 2-3)**
   - Implement OCR + MRZ parsing service module.
   - Finish passport/ticket/card renderers + caching.
3. **Security Hardening (Week 3)**
   - Build audit logging, key rotation, tamper detection.
   - Integrate attestation (SafetyNet/App Attest) checks.
4. **Reminders & Timeline (Week 4)**
   - Implement reminder creation UI, scheduling, snooze loops.
   - Add calendar export + share.
5. **Sync Preview (Week 5)**
   - Ship encrypted snapshot upload/download against mock API.
   - Add conflict resolution + activity feed.

---

## 7. Developer Notes

- Expo/React Native shell kickstarts UI prototyping; native Swift/Kotlin modules should be bridged for camera capture, OCR, and low-level encryption to meet performance/security goals.
- Store secrets (API keys, issuer endpoints) via remote config fetched after device attestation.
- Automate testing with detox (UI), Jest (business logic), and integration tests that validate encrypted outputs.
- Threat model regularly: root detection, screenshot prevention (`FLAG_SECURE`), clipboard scrubbing, and downtime fallback.

