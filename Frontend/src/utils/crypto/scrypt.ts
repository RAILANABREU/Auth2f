export async function deriveKey(
  password: string,
  salt: Uint8Array,
  params: { n: number; r: number; p: number; dkLen: number }
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const importedKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: params.n,
      hash: "SHA-256",
    },
    importedKey,
    params.dkLen * 8
  );

  return new Uint8Array(derivedBits);
}
