import { describe, it, expect } from "vitest";
import {
  CreateClaimSchema,
  CreateCreatorSchema,
  CreateTokenSchema,
  AttachMintSchema,
} from "@/lib/validation/schemas";

describe("CreateClaimSchema", () => {
  const validClaim = {
    creatorSlug: "kai-cenat",
    claimantWallet: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
    claimedRole: "CREATOR",
    verificationMethod: "X_POST",
    signature: "somesig",
    message: "some message",
  };

  it("accepts valid claim data", () => {
    expect(CreateClaimSchema.safeParse(validClaim).success).toBe(true);
  });

  it("rejects invalid claimedRole", () => {
    const r = CreateClaimSchema.safeParse({ ...validClaim, claimedRole: "HACKER" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid verificationMethod", () => {
    const r = CreateClaimSchema.safeParse({
      ...validClaim,
      verificationMethod: "EMAIL",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = CreateClaimSchema.safeParse({ ...validClaim, contactEmail: "notanemail" });
    expect(r.success).toBe(false);
  });

  it("accepts valid email", () => {
    const r = CreateClaimSchema.safeParse({
      ...validClaim,
      contactEmail: "test@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("transforms empty verificationUrl to undefined", () => {
    const r = CreateClaimSchema.safeParse({ ...validClaim, verificationUrl: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.verificationUrl).toBeUndefined();
    }
  });
});

describe("CreateCreatorSchema", () => {
  const validCreator = {
    name: "Kai Cenat",
    slug: "kai-cenat",
  };

  it("accepts valid creator data", () => {
    expect(CreateCreatorSchema.safeParse(validCreator).success).toBe(true);
  });

  it("rejects slug with uppercase", () => {
    const r = CreateCreatorSchema.safeParse({ ...validCreator, slug: "Kai-Cenat" });
    expect(r.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const r = CreateCreatorSchema.safeParse({ ...validCreator, slug: "kai cenat" });
    expect(r.success).toBe(false);
  });
});

describe("CreateTokenSchema", () => {
  const validToken = {
    creatorId: "123e4567-e89b-12d3-a456-426614174000",
    name: "Kai Cenat Community Coin",
    ticker: "KAICENAT",
    description: "Unofficial community token",
    slug: "kai-cenat-coin",
  };

  it("accepts valid token data", () => {
    expect(CreateTokenSchema.safeParse(validToken).success).toBe(true);
  });

  it("rejects name over 32 chars", () => {
    const r = CreateTokenSchema.safeParse({
      ...validToken,
      name: "A".repeat(33),
    });
    expect(r.success).toBe(false);
  });

  it("rejects ticker over 10 chars", () => {
    const r = CreateTokenSchema.safeParse({
      ...validToken,
      ticker: "TOOLONGTICKER",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid creatorId", () => {
    const r = CreateTokenSchema.safeParse({ ...validToken, creatorId: "not-a-uuid" });
    expect(r.success).toBe(false);
  });
});

describe("AttachMintSchema", () => {
  it("accepts valid mint address", () => {
    const r = AttachMintSchema.safeParse({
      mintAddress: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
    });
    expect(r.success).toBe(true);
  });

  it("rejects short mint address", () => {
    const r = AttachMintSchema.safeParse({ mintAddress: "short" });
    expect(r.success).toBe(false);
  });
});
