/**
 * AES-256-GCM helpers powered by passphrase → PBKDF2 key derivation.
 * Used by /aes-demo, safebox edit/view encrypt panels.
 */

export interface AesPackedParts {
  saltHex: string;
  derivedKeyHex: string;
  ivHex: string;
  ciphertextHex: string;
  tagHex: string;
  packedBase64: string;
}

export interface AesDecryptResult {
  plaintext: string;
  derivedKeyHex: string;
}

export function toHex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const passBuf = new TextEncoder().encode(passphrase);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passBuf as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
}

export async function aesEncrypt(passphrase: string, plaintext: string): Promise<AesPackedParts> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const rawKey = await crypto.subtle.exportKey('raw', key);

  const plainBuf = new TextEncoder().encode(plaintext);
  const ctWithTag = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      plainBuf as BufferSource,
    ),
  );
  // AES-GCM result = ciphertext || authTag (last 16 bytes)
  const ciphertext = ctWithTag.slice(0, ctWithTag.length - 16);
  const tag = ctWithTag.slice(ctWithTag.length - 16);

  const packed = new Uint8Array(salt.length + iv.length + ctWithTag.length);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(ctWithTag, salt.length + iv.length);

  return {
    saltHex: toHex(salt),
    derivedKeyHex: toHex(rawKey),
    ivHex: toHex(iv),
    ciphertextHex: toHex(ciphertext),
    tagHex: toHex(tag),
    packedBase64: toBase64(packed),
  };
}

export async function aesDecrypt(passphrase: string, packedBase64: string): Promise<AesDecryptResult> {
  const packed = fromBase64(packedBase64.trim());
  if (packed.length < 16 + 12 + 16) throw new Error('Packed data ไม่ถูก format');
  const salt = packed.slice(0, 16);
  const iv = packed.slice(16, 28);
  const ctWithTag = packed.slice(28);
  const key = await deriveKey(passphrase, salt);
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const ptBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ctWithTag as BufferSource,
  );
  return {
    plaintext: new TextDecoder().decode(ptBuf),
    derivedKeyHex: toHex(rawKey),
  };
}
