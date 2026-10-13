import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, hashPassword, verifyPassword, randomSalt, randomHex, sha256Hex } from "../src/auth/password.js";

describe("validateEmail", () => {
  it("accepts valid", () => expect(validateEmail("a@b.co")).toBeNull());
  it("rejects missing @", () => expect(validateEmail("abc")).toBeTruthy());
  it("rejects empty", () => expect(validateEmail("")).toBeTruthy());
  it("rejects null", () => expect(validateEmail(null)).toBeTruthy());
});

describe("validatePassword", () => {
  it("accepts 12+ with upper/lower/digit", () => expect(validatePassword("Abcdef123456")).toBeNull());
  it("rejects short", () => expect(validatePassword("Ab1")).toBeTruthy());
  it("rejects no upper", () => expect(validatePassword("abcdef123456")).toBeTruthy());
  it("rejects no lower", () => expect(validatePassword("ABCDEF123456")).toBeTruthy());
  it("rejects no digit", () => expect(validatePassword("Abcdefghijkl")).toBeTruthy());
});

describe("hash/verify", () => {
  it("hash differs from plaintext", async () => {
    const salt = randomSalt();
    const h = await hashPassword("Secret12345678", salt);
    expect(h).not.toBe("Secret12345678");
  });
  it("verify accepts correct", async () => {
    const salt = randomSalt();
    const h = await hashPassword("Secret12345678", salt);
    expect(await verifyPassword("Secret12345678", salt, h)).toBe(true);
  });
  it("verify rejects wrong", async () => {
    const salt = randomSalt();
    const h = await hashPassword("Secret12345678", salt);
    expect(await verifyPassword("WrongPassword12", salt, h)).toBe(false);
  });
  it("same password + salt = same hash", async () => {
    const salt = randomSalt();
    const a = await hashPassword("Secret12345678", salt);
    const b = await hashPassword("Secret12345678", salt);
    expect(a).toBe(b);
  });
  it("different salt = different hash", async () => {
    const a = await hashPassword("Secret12345678", randomSalt());
    const b = await hashPassword("Secret12345678", randomSalt());
    expect(a).not.toBe(b);
  });
});

describe("sha256Hex", () => {
  it("returns 64 hex chars", async () => {
    const h = await sha256Hex("hello");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });
  it("is deterministic", async () => {
    expect(await sha256Hex("x")).toBe(await sha256Hex("x"));
  });
});

describe("randomHex", () => {
  it("default 32 bytes = 64 hex", () => {
    expect(randomHex()).toMatch(/^[a-f0-9]{64}$/);
  });
  it("is random", () => {
    expect(randomHex()).not.toBe(randomHex());
  });
});
