import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchDexscreenerMetrics } from "@/lib/metrics/dexscreener";
import { METRICS_STALE_MS } from "@/config/constants";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const supabase = createAdminClient();

  // Find token by mint address
  const { data: token } = await supabase
    .from("community_tokens")
    .select("id, mint_address, name, ticker")
    .eq("mint_address", mint)
    .single();

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  // Get latest snapshot
  const { data: latest } = await supabase
    .from("token_metrics_snapshots")
    .select()
    .eq("token_id", token.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const isStale =
    !latest ||
    Date.now() - new Date(latest.created_at).getTime() > METRICS_STALE_MS;

  if (!isStale) {
    return NextResponse.json({ metrics: latest, fresh: true });
  }

  // Fetch fresh metrics from Dexscreener
  const fresh = await fetchDexscreenerMetrics(mint);

  if (!fresh) {
    // Return stale data or unavailable notice
    return NextResponse.json({
      metrics: latest || null,
      fresh: false,
      message: "Reward tracking unavailable — market data could not be fetched.",
    });
  }

  // Save snapshot
  const { data: snapshot } = await supabase
    .from("token_metrics_snapshots")
    .insert({
      token_id: token.id,
      mint_address: mint,
      market_cap_usd: fresh.market_cap_usd,
      liquidity_usd: fresh.liquidity_usd,
      volume_24h_usd: fresh.volume_24h_usd,
      price_usd: fresh.price_usd,
      source: fresh.source,
      raw_json: fresh.raw_json,
    })
    .select()
    .single();

  return NextResponse.json({ metrics: snapshot, fresh: true });
}
