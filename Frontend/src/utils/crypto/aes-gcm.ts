export async function encryptFile(
  fileData: ArrayBuffer,
  key: Uint8Array,
  nonce: Uint8Array
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    cryptoKey,
    fileData
  );

  return ciphertext;
}

export async function decryptFile(
  ciphertext: ArrayBuffer,
  key: Uint8Array,
  nonce: Uint8Array
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce },
    cryptoKey,
    ciphertext
  );

  return plaintext;
}
