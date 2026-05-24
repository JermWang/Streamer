import { describe, it, expect } from "vitest";
import {
  sanitizeTicker,
  sanitizeTokenName,
  generateCreatorSlug,
  generateVerificationCode,
  buildVerificationPhrase,
  generateTokenMetadata,
  tickerWarnings,
} from "@/lib/metadata/generator";
import type { Creator, CommunityToken } from "@/types/db";

const mockCreator: Creator = {
  id: "test-creator-id",
  name: "Kai Cenat",
  slug: "kai-cenat",
  primary_handle: "KaiCenat",
  platform: "TWITCH",
  platform_url: "https://twitch.tv/kaicenat",
  avatar_url: null,
  bio: null,
  status: "UNCLAIMED",
  verified_wallet: null,
  verified_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockToken: CommunityToken = {
  id: "test-token-id",
  creator_id: "test-creator-id",
  name: "Kai Cenat Community Coin",
  ticker: "KAICENAT",
  description: "Test description",
  slug: "kai-cenat-coin",
  mint_address: null,
  pump_url: null,
  chart_url: null,
  image_url: "https://example.com/image.png",
  metadata_uri: null,
  launch_provider: "PUMPFUN",
  launch_status: "DRAFT",
  affiliation_status: "UNOFFICIAL_COMMUNITY",
  creator_fee_wallet: null,
  creator_fee_notes: null,
  launched_by_wallet: null,
  launched_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("sanitizeTicker", () => {
  it("uppercases and strips invalid chars", () => {
    expect(sanitizeTicker("kai cenat")).toBe("KAICENAT");
  });

  it("truncates to 10 chars", () => {
    expect(sanitizeTicker("verylongtickerhere")).toBe("VERYLONGTI");
  });

  it("removes special characters", () => {
    expect(sanitizeTicker("$KAI!")).toBe("KAI");
  });

  it("handles already valid ticker", () => {
    expect(sanitizeTicker("KAICENAT")).toBe("KAICENAT");
  });
});

describe("sanitizeTokenName", () => {
  it("truncates to 32 chars", () => {
    const long = "A".repeat(40);
    expect(sanitizeTokenName(long)).toHaveLength(32);
  });

  it("leaves short names unchanged", () => {
    expect(sanitizeTokenName("Kai Cenat Community Coin")).toBe("Kai Cenat Community Coin");
  });
});

describe("generateCreatorSlug", () => {
  it("converts name to slug", () => {
    expect(generateCreatorSlug("Kai Cenat")).toBe("kai-cenat");
  });

  it("handles special characters", () => {
    expect(generateCreatorSlug("IShowSpeed")).toBe("ishowspeed");
  });

  it("handles xQc", () => {
    expect(generateCreatorSlug("xQc")).toBe("xqc");
  });

  it("strips leading/trailing hyphens", () => {
    expect(generateCreatorSlug(" test ")).toBe("test");
  });
});

describe("generateVerificationCode", () => {
  it("generates an 8-character code", () => {
    const code = generateVerificationCode();
    expect(code).toHaveLength(8);
  });

  it("only contains valid characters", () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 20 }, generateVerificationCode));
    expect(codes.size).toBeGreaterThan(15);
  });
});

describe("buildVerificationPhrase", () => {
  it("builds correct phrase", () => {
    const phrase = buildVerificationPhrase(
      "https://streamcoin.app",
      "kai-cenat",
      "ABC12345"
    );
    expect(phrase).toBe(
      "I am verifying my claim for https://streamcoin.app/creator/kai-cenat with code ABC12345"
    );
  });
});

describe("tickerWarnings", () => {
  it("returns empty for valid ticker", () => {
    expect(tickerWarnings("KAICENAT")).toHaveLength(0);
  });

  it("warns about sanitization changes", () => {
    const warnings = tickerWarnings("kai cenat");
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("warns about length", () => {
    const warnings = tickerWarnings("VERYLONGTICKERNAME");
    expect(warnings.some((w) => w.includes("truncated"))).toBe(true);
  });
});

describe("generateTokenMetadata", () => {
  it("sets correct name and symbol", () => {
    const meta = generateTokenMetadata(mockCreator, mockToken, "https://streamcoin.app");
    expect(meta.name).toBe(mockToken.name);
    expect(meta.symbol).toBe("KAICENAT");
  });

  it("description denies affiliation for unverified", () => {
    const meta = generateTokenMetadata(mockCreator, mockToken, "https://streamcoin.app");
    // Description must deny affiliation (the word "endorsed" appears in denial context "Not...endorsed by")
    expect(meta.description).toContain("Not affiliated");
    expect(meta.description).not.toMatch(/\bis endorsed\b/i);
    expect(meta.description).not.toMatch(/\bis affiliated\b/i);
  });

  it("marks unclaimed status in attributes", () => {
    const meta = generateTokenMetadata(mockCreator, mockToken, "https://streamcoin.app");
    const claimAttr = meta.attributes.find(
      (a) => a.trait_type === "Creator Claim Status"
    );
    expect(claimAttr?.value).toBe("Unclaimed");
  });

  it("marks verified status when creator is verified", () => {
    const verifiedCreator: Creator = {
      ...mockCreator,
      status: "CREATOR_VERIFIED",
    };
    const meta = generateTokenMetadata(
      verifiedCreator,
      mockToken,
      "https://streamcoin.app"
    );
    const claimAttr = meta.attributes.find(
      (a) => a.trait_type === "Creator Claim Status"
    );
    expect(claimAttr?.value).toBe("Verified");
  });

  it("sets external_url to creator page", () => {
    const meta = generateTokenMetadata(mockCreator, mockToken, "https://streamcoin.app");
    expect(meta.external_url).toBe("https://streamcoin.app/creator/kai-cenat");
  });
});
