import { describe, it, expect } from "vitest";
import { DEFAULT_DISCLAIMER, VERIFIED_DISCLAIMER } from "@/config/constants";

describe("DEFAULT_DISCLAIMER", () => {
  it("includes creator name", () => {
    const text = DEFAULT_DISCLAIMER("Kai Cenat");
    expect(text).toContain("Kai Cenat");
  });

  it("says unofficial community token", () => {
    const text = DEFAULT_DISCLAIMER("Kai Cenat");
    expect(text.toLowerCase()).toContain("unofficial community token");
  });

  it("does not positively claim endorsement or affiliation", () => {
    const text = DEFAULT_DISCLAIMER("Kai Cenat");
    // The disclaimer may use these words in a negative/denial context ("not endorsed by")
    // but must not positively assert them
    expect(text.toLowerCase()).not.toContain("is endorsed");
    expect(text.toLowerCase()).not.toContain("is affiliated");
    expect(text.toLowerCase()).not.toContain("is sponsored");
    expect(text.toLowerCase()).not.toContain("profit");
  });

  it("does not claim guaranteed anything", () => {
    const text = DEFAULT_DISCLAIMER("Kai Cenat");
    expect(text.toLowerCase()).not.toContain("guaranteed reward");
    expect(text.toLowerCase()).not.toContain("guaranteed return");
    expect(text.toLowerCase()).not.toContain("guaranteed profit");
  });

  it("mentions not affiliated", () => {
    const text = DEFAULT_DISCLAIMER("Kai Cenat");
    expect(text).toContain("not affiliated");
  });
});

describe("VERIFIED_DISCLAIMER", () => {
  it("includes creator name", () => {
    const text = VERIFIED_DISCLAIMER("Kai Cenat");
    expect(text).toContain("Kai Cenat");
  });

  it("mentions verification", () => {
    const text = VERIFIED_DISCLAIMER("Kai Cenat");
    expect(text.toLowerCase()).toContain("verification");
  });

  it("explicitly denies guaranteed returns even when verified", () => {
    const text = VERIFIED_DISCLAIMER("Kai Cenat");
    // Verified disclaimer explicitly says "not an investment" and "not guaranteed"
    expect(text.toLowerCase()).not.toContain("profit");
    // The spec requires these words in context of denial, not affirmation
    expect(text.toLowerCase()).not.toMatch(/\bis an investment\b/);
    expect(text.toLowerCase()).not.toMatch(/\bguaranteed rewards\b/);
  });
});
