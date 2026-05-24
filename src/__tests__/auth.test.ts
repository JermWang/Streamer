import { describe, it, expect } from "vitest";
import { buildSignInMessage, generateNonce } from "@/lib/auth/wallet";

describe("buildSignInMessage", () => {
  it("includes site name", () => {
    const msg = buildSignInMessage("abc123", 1234567890);
    expect(msg).toContain("StreamCoin");
  });

  it("includes timestamp", () => {
    const ts = Date.now();
    const msg = buildSignInMessage("abc123", ts);
    expect(msg).toContain(String(ts));
  });

  it("includes nonce", () => {
    const msg = buildSignInMessage("my-nonce-123", 1234567890);
    expect(msg).toContain("my-nonce-123");
  });
});

describe("generateNonce", () => {
  it("returns a 32-char hex string", () => {
    const nonce = generateNonce();
    expect(nonce).toHaveLength(32);
    expect(nonce).toMatch(/^[0-9a-f]+$/);
  });

  it("generates unique nonces", () => {
    const nonces = new Set(Array.from({ length: 20 }, generateNonce));
    expect(nonces.size).toBe(20);
  });
});
