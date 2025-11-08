# Danfo Wallet

Danfo Wallet is a secure, offline-first digital wallet focused on travel credentials. It stores passports, airline tickets, reservations, and payment cards in an encrypted vault while surfacing reminders for expiries and trip timelines. This repository contains the Expo React Native starter, high-level architecture, and reference implementations required to bootstrap the mobile experience.

## Getting Started

```bash
npm install
```

Create a `.env` (or use your shell) with the Supabase connection values:

```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Optional: use a hosted deep-link that Supabase will redirect to after email verification.
EXPO_PUBLIC_SUPABASE_REDIRECT_URL=https://yourdomain.com/auth-callback
```

Then start the Expo development server:

```bash
npm run start
```

Use the Expo CLI prompts to run on Android, iOS, or web. Native modules (biometrics, OCR, encryption, camera) will require the Expo prebuild/eject workflow when moving beyond prototyping.

## Project Structure

- `App.tsx` – root providers and navigation gate between auth flow and the wallet.
- `src/types` – domain models for documents, reservations, cards, reminders, timeline.
- `src/context/WalletContext.tsx` – global state container with reminder scheduling hooks.
- `src/context/AuthContext.tsx` – Supabase-backed authentication provider (session persistence, email verification).
- `src/modules/rendering` – reference Skia rendering pipelines for passports, tickets, cards.
- `src/utils/encryption.ts` – AES-256 encryption helpers backed by SecureStore/Keychain.
- `src/screens/SignIn|SignUp|VerifyEmail` – onboarding flow for creating accounts and confirming email addresses.
- `src/screens/ScannerScreen.tsx` – camera-powered document capture that injects scanned documents into the wallet state.
- `docs/` – architecture blueprint, PlantUML diagram, roadmap, and API contracts.

## Key Capabilities

- **Account onboarding**: Supabase email/password authentication, enforced email verification, and persisted sessions (AsyncStorage).
- **Template Rendering**: Local Skia-based renderers for passport, ticket, and payment card experiences generate branded, encrypted PNGs ready for secure storage.
- **Secure Vault**: AES-256 encryption with device-kept keys, SQLCipher schema outline, biometric gating, and audit log guidance.
- **Timeline & Reminders**: Reducer-driven timeline synchronization plus Expo notifications for upcoming trips and expiries.
- **Offline-first**: All critical workflows run locally; optional zero-knowledge cloud backup is defined for future expansion.
- **Document capture**: Expo Camera integration allows users to scan travel documents directly into the wallet and encrypt them with the existing pipeline.

## Authentication Flow

1. Launch the app and choose **Create account**.
2. Supply first/last name, email, and password. Supabase sends a verification email automatically.
3. Tap the verification link (the optional redirect URL should resolve to a page you control; after confirming you can return to the app).
4. Sign in with the verified credentials and access the full wallet UI, including document scanning.

## Documentation

Full technical blueprint including architecture diagram, storage schema, security posture, biometric flows, and mock cloud API contracts lives in `docs/blueprint.md`. The diagram source is available at `docs/architecture.puml`.

## Next Steps

1. Integrate OCR (ML Kit/Tesseract) and barcode parsing (ZXing) modules.
2. Bridge native biometric prompts and secure storage in Kotlin/Swift.
3. Implement SQLCipher-backed vault and audit logging.
4. Connect timeline/reminder state to UI screens and scheduling flows.

## Security Considerations

- Enforce biometric/PIN unlock before revealing sensitive data.
- Guard against screenshots and clipboard leakage for rendered assets.
- Rotate vault keys on device compromise and scrub decrypted assets from memory immediately after use.
- Maintain offline audit logs to support transparency and future sync reconciliation.

