import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { LegalDisclaimer } from "@/components/ui/LegalDisclaimer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricsPanel } from "@/components/ui/MetricsPanel";
import type { TokenMetricsSnapshot } from "@/types/db";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ mint: string }>;
}

export default async function TokenPage({ params }: PageProps) {
  const { mint } = await params;
  const supabase = createAdminClient();

  const { data: token } = await supabase
    .from("community_tokens")
    .select("*, creators(*)")
    .eq("mint_address", mint)
    .single();

  if (!token) notFound();

  const creator = token.creators;

  const { data: metrics } = await supabase
    .from("token_metrics_snapshots")
    .select()
    .eq("token_id", token.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single() as { data: TokenMetricsSnapshot | null };

  const isVerified =
    creator?.status === "CREATOR_VERIFIED" ||
    creator?.status === "OFFICIAL_PARTNER";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">{token.name}</h1>
          <StatusBadge status={token.launch_status} />
        </div>
        <p className="text-lg font-mono font-medium text-gray-700">${token.ticker}</p>
        {creator && (
          <p className="text-sm text-gray-500 mt-1">
            Community token named after{" "}
            <Link href={`/creator/${creator.slug}`} className="text-blue-600 hover:underline">
              {creator.name}
            </Link>
          </p>
        )}
      </div>

      {creator && (
        <LegalDisclaimer
          creatorName={creator.name}
          verified={isVerified}
          className="mb-6"
        />
      )}

      <MetricsPanel
        metrics={metrics}
        mintAddress={token.mint_address}
        pumpUrl={token.pump_url}
        chartUrl={token.chart_url}
      />

      <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Token Info</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Mint Address</dt>
          <dd className="text-gray-900 font-mono text-xs break-all">{token.mint_address}</dd>

          <dt className="text-gray-500">Launch Provider</dt>
          <dd className="text-gray-900">{token.launch_provider}</dd>

          <dt className="text-gray-500">Affiliation</dt>
          <dd>{isVerified ? "Creator Claimed" : "Unofficial Community Token"}</dd>

          <dt className="text-gray-500">Creator Fees</dt>
          <dd className="text-xs text-gray-700">
            {token.creator_fee_wallet
              ? `Pump.fun/PumpSwap routing — wallet ending ...${token.creator_fee_wallet.slice(-8)}`
              : "Not configured — see Pump.fun records"}
          </dd>
        </dl>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {creator && (
          <Link
            href={`/creator/${creator.slug}`}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            Creator Page
          </Link>
        )}
        {!isVerified && creator && (
          <Link
            href={`/claim/${creator.slug}`}
            className="px-4 py-2 text-sm border border-gray-900 text-gray-900 rounded hover:bg-gray-900 hover:text-white font-medium"
          >
            Claim as Creator
          </Link>
        )}
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to all tokens
        </Link>
      </div>
    </div>
  );
}
