import { deriveKey } from "./scrypt";
import { encryptFile } from "./aes-gcm";
import { decryptFile } from "./aes-gcm";

export interface EncryptionParams {
  n: number;
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
    n: 16384,
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


export async function decryptEnvelope(
  envelope: {
    ciphertext: string; // base64 vindo do backend
    salt: string;
    nonce: string;
    kdf_params: EncryptionParams;
  },
  password: string
): Promise<Uint8Array> {
  // Converte base64 para Uint8Array
  const b64ToBytes = (b64: string) =>
    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  const saltBytes = b64ToBytes(envelope.salt);
  const nonceBytes = b64ToBytes(envelope.nonce);
  const ciphertextBytes = b64ToBytes(envelope.ciphertext);

  // Deriva a chave usando o mesmo método scrypt
  const key = await deriveKey(password, saltBytes, envelope.kdf_params);

  // Decripta usando AES-GCM
  const plaintext = await decryptFile(ciphertextBytes.buffer, key, nonceBytes);

  return new Uint8Array(plaintext);
}