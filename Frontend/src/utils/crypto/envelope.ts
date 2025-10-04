import { deriveKey } from './scrypt';
import { encryptFile } from './aes-gcm';

export interface EncryptionParams {
  N: number;
  r: number;
  p: number;
  dkLen: number;
}

export interface EncryptedEnvelope {
  ciphertext: Blob;
  salt: string;
  nonce: string;
  kdfParams: EncryptionParams;
}

export async function createEncryptedEnvelope(
  file: File,
  password: string
): Promise<EncryptedEnvelope> {
  // Generate random salt and nonce
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  // KDF parameters
  const kdfParams: EncryptionParams = {
    N: 16384,
    r: 8,
    p: 1,
    dkLen: 32,
  };

  // Derive encryption key
  const key = await deriveKey(password, salt, kdfParams);

  // Read file data
  const fileData = await file.arrayBuffer();

  // Encrypt file
  const ciphertext = await encryptFile(fileData, key, nonce);

  // Convert to base64 for transport
  const saltB64 = btoa(String.fromCharCode(...salt));
  const nonceB64 = btoa(String.fromCharCode(...nonce));

  return {
    ciphertext: new Blob([ciphertext]),
    salt: saltB64,
    nonce: nonceB64,
    kdfParams,
  };
}
