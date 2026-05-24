import { describe, it, expect } from "vitest";
import { manualProvider } from "@/lib/launch/providers/manual";
import { getPumpPortalProvider } from "@/lib/launch/providers/pumpportal";
import type { LaunchTokenInput } from "@/lib/launch/providers/types";

const testInput: LaunchTokenInput = {
  name: "Kai Cenat Community Coin",
  ticker: "KAICENAT",
  description: "Unofficial community token",
  imageUrl: "https://example.com/image.png",
  creatorWallet: "TestWallet123",
};

describe("manualProvider", () => {
  it("is always available", () => {
    expect(manualProvider.available).toBe(true);
  });

  it("createToken returns failure with manual launch message", async () => {
    const result = await manualProvider.createToken(testInput);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/[Mm]anual/);
  });

  it("getManualChecklist includes all required fields", () => {
    const checklist = manualProvider.getManualChecklist(testInput);
    expect(checklist.name).toBe(testInput.name);
    expect(checklist.ticker).toBe(testInput.ticker);
    expect(checklist.instructions.length).toBeGreaterThan(3);
    expect(checklist.suggestedDisclaimer).toContain("Not affiliated");
  });

  it("checklist instructions include pump.fun URL", () => {
    const checklist = manualProvider.getManualChecklist(testInput);
    const hasPumpFun = checklist.instructions.some((i) =>
      i.toLowerCase().includes("pump.fun")
    );
    expect(hasPumpFun).toBe(true);
  });
});

describe("getPumpPortalProvider", () => {
  it("returns null when no API key provided", () => {
    expect(getPumpPortalProvider(undefined)).toBeNull();
    expect(getPumpPortalProvider("")).toBeNull();
  });

  it("returns provider when API key provided", () => {
    const provider = getPumpPortalProvider("test-api-key");
    expect(provider).not.toBeNull();
    expect(provider?.name).toBe("PUMPPORTAL");
    expect(provider?.available).toBe(true);
  });

  it("createToken fails without metadataUri", async () => {
    const provider = getPumpPortalProvider("test-api-key")!;
    const result = await provider.createToken(testInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain("metadataUri");
  });
});
