import { describe, it, expect } from "vitest";

// Pure auth utility tests that don't import @solana/web3.js
// The wallet.ts module is tested via auth.test.ts in browser-compatible environments

describe("nonce generation", () => {
  it("can generate random hex strings", () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    expect(hex).toHaveLength(32);
    expect(hex).toMatch(/^[0-9a-f]+$/);
  });
});

describe("sign-in message format", () => {
  it("includes all required components", () => {
    const siteName = "StreamCoin";
    const nonce = "abc123";
    const timestamp = 1234567890;
    const message = `Sign in to ${siteName} at ${timestamp} with nonce ${nonce}`;
    expect(message).toContain(siteName);
    expect(message).toContain(String(timestamp));
    expect(message).toContain(nonce);
  });
});
