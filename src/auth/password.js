const ITERATIONS = 100000;
const KEYLEN = 32;

function b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function randomHex(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map(b => b.toString(16).padStart(2, "0")).join("");
}

export function randomSalt() {
  return randomHex(16);
}

export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: ITERATIONS, hash: "SHA-256" },
    key,
    KEYLEN * 8
  );
  return b64(bits);
}

export async function verifyPassword(password, salt, expectedHash) {
  const h = await hashPassword(password, salt);
  if (h.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  return diff === 0;
}

export async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export function validatePassword(pw) {
  if (typeof pw !== "string") return "Password required";
  if (pw.length < 12) return "Password must be at least 12 characters";
  if (!/[A-Z]/.test(pw)) return "Password must contain uppercase";
  if (!/[a-z]/.test(pw)) return "Password must contain lowercase";
  if (!/[0-9]/.test(pw)) return "Password must contain number";
  return null;
}

export function validateEmail(email) {
  if (typeof email !== "string") return "Email required";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return "Invalid email";
  return null;
}
