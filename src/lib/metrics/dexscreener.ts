import { DEXSCREENER_BASE_URL } from "@/config/constants";

export interface DexscreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; symbol: string };
  priceUsd: string;
  volume: { h24: number };
  liquidity?: { usd: number };
  fdv?: number;
  marketCap?: number;
}

export interface DexscreenerResponse {
  pairs: DexscreenerPair[] | null;
}

export interface MetricsData {
  market_cap_usd: number | null;
  liquidity_usd: number | null;
  volume_24h_usd: number | null;
  price_usd: number | null;
  source: string;
  raw_json: unknown;
}

export async function fetchDexscreenerMetrics(
  mintAddress: string
): Promise<MetricsData | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const data = (await res.json()) as DexscreenerResponse;
    const pairs = data.pairs;
    if (!pairs || pairs.length === 0) return null;

    // Use the highest liquidity pair
    const best = pairs.sort(
      (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
    )[0];

    return {
      market_cap_usd: best.marketCap ?? best.fdv ?? null,
      liquidity_usd: best.liquidity?.usd ?? null,
      volume_24h_usd: best.volume?.h24 ?? null,
      price_usd: parseFloat(best.priceUsd) || null,
      source: "dexscreener",
      raw_json: best,
    };
  } catch {
    return null;
  }
}

export function getDexscreenerUrl(mintAddress: string): string {
  return `${DEXSCREENER_BASE_URL}/${mintAddress}`;
}

export function getBirdeyeUrl(mintAddress: string): string {
  return `https://birdeye.so/token/${mintAddress}?chain=solana`;
}

export function getPumpFunUrl(mintAddress: string): string {
  return `https://pump.fun/${mintAddress}`;
}
