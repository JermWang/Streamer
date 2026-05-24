export const SITE_NAME = "StreamCoin";
export const SITE_DESCRIPTION =
  "Community streamer coins, claimable by the creators.";

export const PUMP_FUN_BASE_URL = "https://pump.fun";
export const PUMPPORTAL_API_BASE = "https://pumpportal.fun/api";
export const DEXSCREENER_BASE_URL = "https://dexscreener.com/solana";
export const BIRDEYE_BASE_URL = "https://birdeye.so/token";
export const SOLSCAN_BASE_URL = "https://solscan.io/token";

export const SOLANA_CLUSTER = "mainnet-beta" as const;

// Ticker constraints for Pump.fun
export const MAX_TICKER_LENGTH = 10;
export const MAX_TOKEN_NAME_LENGTH = 32;
export const MAX_DESCRIPTION_LENGTH = 500;

// Claim verification
export const VERIFICATION_CODE_PREFIX = "STREAMCOIN-VERIFY";
export const CLAIM_RATE_LIMIT_MINUTES = 60;

// Metrics snapshot staleness threshold (ms)
export const METRICS_STALE_MS = 5 * 60 * 1000; // 5 minutes

export const DEFAULT_DISCLAIMER = (creatorName: string) =>
  `This is an unofficial community token named after ${creatorName}. It is not affiliated with, endorsed by, sponsored by, or controlled by ${creatorName} unless explicitly marked Verified. Creator rewards may be claimed or redirected by ${creatorName} or an authorized representative after verification, subject to the capabilities of the underlying launch/fee provider.`;

export const VERIFIED_DISCLAIMER = (creatorName: string) =>
  `This creator or an authorized representative has completed platform verification for ${creatorName}. Verification confirms claim access on this site only and does not by itself make this token an investment, security, or guaranteed source of rewards.`;
