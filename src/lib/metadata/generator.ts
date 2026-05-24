import { MAX_TICKER_LENGTH, MAX_TOKEN_NAME_LENGTH } from "@/config/constants";
import type { Creator, CommunityToken } from "@/types/db";

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

export function sanitizeTicker(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, MAX_TICKER_LENGTH);
}

export function sanitizeTokenName(raw: string): string {
  return raw.slice(0, MAX_TOKEN_NAME_LENGTH);
}

export function generateCreatorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function buildVerificationPhrase(
  siteUrl: string,
  creatorSlug: string,
  verificationCode: string
): string {
  return `I am verifying my claim for ${siteUrl}/creator/${creatorSlug} with code ${verificationCode}`;
}

export function generateTokenMetadata(
  creator: Creator,
  token: CommunityToken,
  siteUrl: string
): TokenMetadata {
  const isVerified =
    creator.status === "CREATOR_VERIFIED" ||
    creator.status === "OFFICIAL_PARTNER";

  return {
    name: token.name,
    symbol: sanitizeTicker(token.ticker),
    description: `Unofficial community token named after ${creator.name}. Not affiliated with, endorsed by, sponsored by, or controlled by ${creator.name} unless marked Verified.`,
    image: token.image_url || "",
    external_url: `${siteUrl}/creator/${creator.slug}`,
    attributes: [
      {
        trait_type: "Status",
        value: "Unofficial Community Token",
      },
      {
        trait_type: "Creator Claim Status",
        value: isVerified ? "Verified" : "Unclaimed",
      },
      {
        trait_type: "Platform",
        value: creator.platform || "Unknown",
      },
      {
        trait_type: "Affiliation",
        value: "Not Affiliated Unless Verified",
      },
    ],
  };
}

export function tickerWarnings(ticker: string): string[] {
  const warnings: string[] = [];
  const sanitized = sanitizeTicker(ticker);
  if (sanitized !== ticker.toUpperCase()) {
    warnings.push(
      `Ticker was sanitized from "${ticker}" to "${sanitized}". Characters removed: ${ticker.toUpperCase().replace(/[A-Z0-9]/g, "")}`
    );
  }
  if (ticker.length > MAX_TICKER_LENGTH) {
    warnings.push(
      `Ticker "${ticker}" exceeds ${MAX_TICKER_LENGTH} characters and will be truncated to "${sanitized}".`
    );
  }
  return warnings;
}
