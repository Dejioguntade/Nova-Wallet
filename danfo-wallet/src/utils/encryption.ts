import 'text-encoding';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

type Serializable = Record<string, unknown> | unknown[];

interface EncryptionContext {
  keyAlias?: string;
  migrate?: boolean;
}

const DEFAULT_KEY_ALIAS = 'danfo-wallet:vault:key:v1';
const KEY_SIZE_BYTES = 32;
const IV_SIZE_BYTES = 16;

const ensureVaultKey = async (keyAlias: string) => {
  const existing = await SecureStore.getItemAsync(keyAlias, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  if (existing) {
    return existing;
  }

  const random = CryptoJS.lib.WordArray.random(KEY_SIZE_BYTES);
  const encoded = CryptoJS.enc.Base64.stringify(random);

  await SecureStore.setItemAsync(keyAlias, encoded, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  return encoded;
};

const uint8ArrayToWordArray = (bytes: Uint8Array) => {
  const words: number[] = [];
  const len = bytes.length;

  for (let i = 0; i < len; i += 1) {
    words[i >>> 2] = words[i >>> 2] || 0;
    words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }

  return CryptoJS.lib.WordArray.create(words, len);
};

const wordArrayToUint8Array = (wordArray: CryptoJS.lib.WordArray) => {
  const { words, sigBytes } = wordArray;
  const bytes = new Uint8Array(sigBytes);

  for (let i = 0; i < sigBytes; i += 1) {
    bytes[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }

  return bytes;
};

const concatIvAndCiphertext = (iv: CryptoJS.lib.WordArray, ciphertext: CryptoJS.lib.WordArray) =>
  CryptoJS.lib.WordArray.create(iv.words.concat(ciphertext.words), iv.sigBytes + ciphertext.sigBytes);

const splitIvAndCiphertext = (payload: CryptoJS.lib.WordArray) => {
  const iv = CryptoJS.lib.WordArray.create(payload.words.slice(0, IV_SIZE_BYTES / 4), IV_SIZE_BYTES);
  const ciphertext = CryptoJS.lib.WordArray.create(
    payload.words.slice(IV_SIZE_BYTES / 4),
    payload.sigBytes - IV_SIZE_BYTES,
  );
  return { iv, ciphertext };
};

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

export const decryptToBytes = async (
  payload: string,
  context: EncryptionContext = {},
): Promise<Uint8Array> => {
  const keyAlias = context.keyAlias ?? DEFAULT_KEY_ALIAS;
  const base64Key = await ensureVaultKey(keyAlias);
  const key = CryptoJS.enc.Base64.parse(base64Key);
  const rawPayload = CryptoJS.enc.Base64.parse(payload);
  const { iv, ciphertext } = splitIvAndCiphertext(rawPayload);

  const decrypted = CryptoJS.AES.decrypt(CryptoJS.lib.CipherParams.create({ ciphertext }), key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return wordArrayToUint8Array(decrypted);
};

export const encryptJson = async (value: Serializable, context?: EncryptionContext) => {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  return encryptBytes(bytes, context);
};

export const decryptJson = async <T = unknown>(payload: string, context?: EncryptionContext) => {
  const bytes = await decryptToBytes(payload, context);
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as T;
};

export const rotateVaultKey = async (oldAlias: string, newAlias: string) => {
  const oldKey = await SecureStore.getItemAsync(oldAlias);
  if (!oldKey) return false;

  await ensureVaultKey(newAlias);
  await SecureStore.deleteItemAsync(oldAlias);
  return true;
};

export const clearVaultKey = (keyAlias: string = DEFAULT_KEY_ALIAS) =>
  SecureStore.deleteItemAsync(keyAlias);

