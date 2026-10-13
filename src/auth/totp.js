const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf) {
  let bits = 0, value = 0, out = "";
  for (const b of new Uint8Array(buf)) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(str) {
  const clean = str.replace(/=+$/, "").toUpperCase();
  let bits = 0, value = 0;
  const out = [];
  for (const c of clean) {
    const idx = ALPHABET.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

export function generateSecret(bytes = 20) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base32Encode(arr);
}

async function hmacSha1(key, msg) {
  const ck = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", ck, msg));
}

export async function generateTOTP(secret, timeStep = 30, digits = 6, offset = 0) {
  const counter = Math.floor(Date.now() / 1000 / timeStep) + offset;
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(4, counter, false);
  const key = base32Decode(secret);
  const hmac = await hmacSha1(key, new Uint8Array(buf));
  const off = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[off] & 0x7f) << 24) |
    ((hmac[off + 1] & 0xff) << 16) |
    ((hmac[off + 2] & 0xff) << 8) |
    (hmac[off + 3] & 0xff);
  return String(code % Math.pow(10, digits)).padStart(digits, "0");
}

export async function verifyTOTP(secret, token, window = 1) {
  if (!secret || !token) return false;
  for (let i = -window; i <= window; i++) {
    const t = await generateTOTP(secret, 30, 6, i);
    if (t === token) return true;
  }
  return false;
}

export function otpauthURI(secret, email, issuer = "Meridian") {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function generateRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const arr = new Uint8Array(5);
    crypto.getRandomValues(arr);
    const hex = [...arr].map(b => b.toString(16).padStart(2, "0")).join("");
    codes.push(hex.slice(0, 5).toUpperCase() + "-" + hex.slice(5, 10).toUpperCase());
  }
  return codes;
}
