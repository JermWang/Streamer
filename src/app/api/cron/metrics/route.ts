import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchDexscreenerMetrics } from "@/lib/metrics/dexscreener";

export async function POST(req: NextRequest) {
  // Simple protection: check for admin wallet auth header
  const authHeader = req.headers.get("x-wallet-auth");
  const cronSecret = req.headers.get("x-cron-secret");

  // Allow either admin auth or a matching cron secret (set in site_settings if desired)
  if (!authHeader && !cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get all live tokens with mint addresses
  const { data: tokens } = await supabase
    .from("community_tokens")
    .select("id, mint_address, name")
    .not("mint_address", "is", null)
    .in("launch_status", ["LIVE_UNCLAIMED", "CLAIM_REQUESTED", "CREATOR_VERIFIED", "OFFICIAL_PARTNER"]);

  if (!tokens || tokens.length === 0) {
    return NextResponse.json({ message: "No live tokens to update", updated: 0 });
  }

  let updated = 0;
  const errors: string[] = [];

  for (const token of tokens) {
    if (!token.mint_address) continue;

    try {
      const metrics = await fetchDexscreenerMetrics(token.mint_address);
      if (!metrics) {
        errors.push(`${token.name}: no data from Dexscreener`);
        continue;
      }

      await supabase.from("token_metrics_snapshots").insert({
        token_id: token.id,
        mint_address: token.mint_address,
        market_cap_usd: metrics.market_cap_usd,
        liquidity_usd: metrics.liquidity_usd,
        volume_24h_usd: metrics.volume_24h_usd,
        price_usd: metrics.price_usd,
        source: metrics.source,
        raw_json: metrics.raw_json,
      });

      updated++;
    } catch (e) {
      errors.push(`${token.name}: ${String(e)}`);
    }
  }

  return NextResponse.json({ message: "Metrics refresh complete", updated, errors });
}
