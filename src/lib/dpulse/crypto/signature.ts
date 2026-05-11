// Browser-compatible crypto utilities using Web Crypto API

export async function verifyMessage(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: CryptoKey,
): Promise<boolean> {
  try {
    const isValid = await globalThis.crypto.subtle.verify(
      'Ed25519',
      publicKey,
      signature as BufferSource,
      message as BufferSource,
    );
    return isValid;
  } catch (_error) {
    return false;
  }
}

export function base64ToSignature(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const signature = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    signature[i] = binaryString.charCodeAt(i);
  }
  return signature;
}

// Key import/export functions

export async function importPublicKey(pem: string): Promise<CryptoKey> {
  // Remove PEM header and footer
  const pemContents = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');

  // Decode base64 to binary
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Import the key
  return globalThis.crypto.subtle.importKey(
    'spki',
    bytes,
    {
      name: 'Ed25519',
      namedCurve: 'Ed25519',
    },
    false,
    ['verify'],
  );
}
