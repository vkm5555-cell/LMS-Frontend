// Small encryption helpers using Web Crypto (AES-GCM with PBKDF2-derived key)
// Exports: encryptText(plaintext, passphrase) -> base64 string
//          decryptText(base64, passphrase) -> plaintext
// Notes:
// - passphrase should come from an env var (e.g. VITE_ENCRYPTION_KEY).
// - We prefix the output with salt(16 bytes) + iv(12 bytes) + ciphertext, all base64-encoded.

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64(u8: Uint8Array) {
  // chunked conversion to avoid call stack issues
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    const slice = u8.subarray(i, Math.min(i + chunk, u8.length));
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(binary);
}

function fromBase64(b64: string) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: BufferSource) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      // cast to any to satisfy lib typing when passing TypedArray
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    } as Pbkdf2Params,
    baseKey,
    { name: 'AES-GCM', length: 256 } as AesDerivedKeyParams,
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(plainText: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    textEncoder.encode(plainText)
  );
  const cipherBytes = new Uint8Array(cipherBuf);
  // combined: salt + iv + cipher
  const out = new Uint8Array(salt.byteLength + iv.byteLength + cipherBytes.byteLength);
  out.set(salt, 0);
  out.set(iv, salt.byteLength);
  out.set(cipherBytes, salt.byteLength + iv.byteLength);
  return toBase64(out);
}

export async function decryptText(b64: string, passphrase: string): Promise<string> {
  const data = fromBase64(b64);
  if (data.length < 16 + 12) throw new Error('Invalid data');
  const salt = data.subarray(0, 16);
  const iv = data.subarray(16, 28);
  const cipher = data.subarray(28);
  const key = await deriveKey(passphrase, salt.buffer ? salt.buffer : salt);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return textDecoder.decode(plainBuf);
}

export default { encryptText, decryptText };
