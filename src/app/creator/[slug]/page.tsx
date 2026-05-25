export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { StreamEmbed } from "@/components/stream/StreamEmbed";
import { LegalDisclaimer } from "@/components/ui/LegalDisclaimer";
import { MetricsPanel } from "@/components/ui/MetricsPanel";
import { CreatorProofNudge } from "@/components/ui/SocialProof";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CommunityToken, Creator, TokenMetricsSnapshot } from "@/types/db";

interface CreatorWithTokens extends Creator {
  community_tokens: CommunityToken[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCreatorData(slug: string): Promise<CreatorWithTokens | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("creators")
    .select("*, community_tokens(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching creator:", error.message);
    return null;
  }

  return data as CreatorWithTokens;
}

async function getLatestMetrics(tokenId: string): Promise<TokenMetricsSnapshot | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("token_metrics_snapshots")
    .select()
    .eq("token_id", tokenId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching token metrics:", error.message);
    return null;
  }

  return data as TokenMetricsSnapshot | null;
}

function shortAddr(addr: string | null | undefined, size = 4) {
  if (!addr) return "Not attached";
  return `${addr.slice(0, size)}...${addr.slice(-size)}`;
}

function platformLabel(platform: Creator["platform"]) {
  if (!platform) return "Creator channel";
  return platform.charAt(0) + platform.slice(1).toLowerCase();
}

function handleLabel(creator: Creator) {
  if (creator.primary_handle) {
    return creator.primary_handle.startsWith("@")
      ? creator.primary_handle
      : `@${creator.primary_handle}`;
  }

  return `@${creator.slug}`;
}

function avatarUrl(creator: Creator, token?: CommunityToken | null) {
  if (creator.avatar_url) return creator.avatar_url;
  if (token?.image_url) return token.image_url;

  const handle = (creator.primary_handle ?? creator.slug)
    .replace(/^@/, "")
    .replace(/[^a-zA-Z0-9_]/g, "");
  return `https://unavatar.io/twitter/${handle}`;
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "Unavailable";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatSol(value: number | null | undefined) {
  if (value == null) return "Unavailable";
  return `${value.toFixed(3)} SOL`;
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong className={mono ? "mono" : undefined}>{value}</strong>
    </div>
  );
}

export default async function CreatorPage({ params }: PageProps) {
  const { slug } = await params;
  const creator = await getCreatorData(slug);

  if (!creator) notFound();

  const token = creator.community_tokens?.[0] ?? null;
  const metrics = token ? await getLatestMetrics(token.id) : null;
  const isVerified =
    creator.status === "CREATOR_VERIFIED" || creator.status === "OFFICIAL_PARTNER";
  const displayStatus = isVerified ? creator.status : token?.launch_status ?? creator.status;
  const channelLabel = platformLabel(creator.platform);

  return (
    <div className="page streamer-page">
      <div className="streamer-hero">
        <div className="streamer-hero-bg">
          <img src={avatarUrl(creator, token)} alt="" />
        </div>
        <div className="streamer-avatar">
          <img src={avatarUrl(creator, token)} alt={creator.name} />
        </div>
        <div className="streamer-id">
          <div className="streamer-kicker">
            <span className="kicker-line" />
            STREAMCOIN RAID ROOM
          </div>
          <h1>{creator.name}</h1>
          <div className="streamer-meta">
            {token && <span className="profile-ticker">${token.ticker}</span>}
            <span>{handleLabel(creator)}</span>
            <span>{channelLabel}</span>
            {token?.mint_address && (
              <span className="mono">{shortAddr(token.mint_address, 5)}</span>
            )}
          </div>
          <div className="streamer-badges">
            <StatusBadge status={displayStatus} />
            {!isVerified && <StatusBadge status="UNOFFICIAL_COMMUNITY" />}
          </div>
        </div>
        <div className="streamer-actions">
          {creator.platform_url && (
            <a
              href={creator.platform_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Raid {channelLabel}
            </a>
          )}
          {token?.pump_url && (
            <a
              href={token.pump_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Pump.fun
            </a>
          )}
          {!isVerified && (
            <Link href={`/claim/${creator.slug}`} className="btn btn-secondary">
              Claim fees
            </Link>
          )}
        </div>
      </div>

      {!isVerified && (
        <LegalDisclaimer creatorName={creator.name} verified={false} className="mb-16" />
      )}

      <div className="streamer-layout">
        <div className="streamer-main">
          <StreamEmbed
            creatorName={creator.name}
            platform={creator.platform}
            platformUrl={creator.platform_url}
            handle={creator.primary_handle}
          />

          <div className="section">
            <div className="section-head">
              <div className="section-title">Pump.fun Token Control Room</div>
            </div>
            {token ? (
              <MetricsPanel
                metrics={metrics}
                mintAddress={token.mint_address}
                pumpUrl={token.pump_url}
                chartUrl={token.chart_url}
              />
            ) : (
              <div className="chart-card empty-card">
                No token has been drafted for this creator yet.
              </div>
            )}
          </div>

          {token && (
            <div className="token-control-grid">
              <div className="module">
                <div className="module-head">
                  <div className="module-title">Token Contract</div>
                  <StatusBadge status={token.launch_status} />
                </div>
                <div className="module-body detail-list">
                  <DetailRow label="Token name" value={token.name} />
                  <DetailRow label="Ticker" value={`$${token.ticker}`} mono />
                  <DetailRow
                    label="Mint contract"
                    value={token.mint_address ?? "Not attached yet"}
                    mono={Boolean(token.mint_address)}
                  />
                  <DetailRow label="Launch provider" value={token.launch_provider} />
                  <DetailRow
                    label="Affiliation"
                    value={isVerified ? "Creator claimed" : "Unofficial community token"}
                  />
                  <div className="detail-actions">
                    {token.mint_address && (
                      <a
                        href={`https://solscan.io/token/${token.mint_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        Solscan
                      </a>
                    )}
                    {token.pump_url && (
                      <a
                        href={token.pump_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        Pump.fun coin
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="module">
                <div className="module-head">
                  <div className="module-title">Creator Fee Vault</div>
                </div>
                <div className="module-body detail-list">
                  <DetailRow
                    label="Fee wallet"
                    value={
                      token.creator_fee_wallet
                        ? shortAddr(token.creator_fee_wallet, 6)
                        : "Not configured"
                    }
                    mono={Boolean(token.creator_fee_wallet)}
                  />
                  <DetailRow
                    label="Estimated SOL"
                    value={formatSol(metrics?.creator_rewards_estimate_sol)}
                    mono={Boolean(metrics?.creator_rewards_estimate_sol)}
                  />
                  <DetailRow
                    label="Estimated USD"
                    value={formatCurrency(metrics?.creator_rewards_estimate_usd)}
                    mono={Boolean(metrics?.creator_rewards_estimate_usd)}
                  />
                  <DetailRow
                    label="Tracking"
                    value={metrics ? `via ${metrics.source}` : "Awaiting indexer data"}
                  />
                  {token.creator_fee_notes && (
                    <div className="fee-note">{token.creator_fee_notes}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="streamer-sidebar">
          {isVerified ? (
            <div className="module verified-module">
              <div className="module-head">
                <div className="module-title">Verified Creator</div>
                <StatusBadge status={creator.status} />
              </div>
              <div className="module-body">
                <p>
                  This page is controlled by the verified creator. Fee routing is
                  shown from the token record where supported by the launch provider.
                </p>
                <LegalDisclaimer creatorName={creator.name} verified />
              </div>
            </div>
          ) : (
            <div className="claim-cta raid-claim">
              <h4>Tell {creator.name} to claim this.</h4>
              <p>
                The community token is already indexed. Send the live channel here,
                tell them to verify identity, and route supported Pump.fun creator fees.
              </p>
              <Link href={`/claim/${creator.slug}`} className="btn btn-primary btn-sm btn-flex">
                Claim creator fees
              </Link>
            </div>
          )}

          {!isVerified && <CreatorProofNudge />}

          <div className="module">
            <div className="module-head">
              <div className="module-title">Raid Links</div>
            </div>
            <div className="module-body link-stack">
              {creator.platform_url && (
                <a href={creator.platform_url} target="_blank" rel="noopener noreferrer">
                  <span>
                    <strong>{channelLabel} channel</strong>
                    <small>{handleLabel(creator)}</small>
                  </span>
                  <b>Open</b>
                </a>
              )}
              {token?.pump_url && (
                <a href={token.pump_url} target="_blank" rel="noopener noreferrer">
                  <span>
                    <strong>Pump.fun page</strong>
                    <small>${token.ticker}</small>
                  </span>
                  <b>Open</b>
                </a>
              )}
              {token?.mint_address && (
                <a
                  href={`https://dexscreener.com/solana/${token.mint_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <strong>DexScreener</strong>
                    <small>Market chart</small>
                  </span>
                  <b>Open</b>
                </a>
              )}
            </div>
          </div>

          <div className="module">
            <div className="module-head">
              <div className="module-title">Claim Message</div>
            </div>
            <div className="module-body">
              <div className="code-box raid-message">
                {creator.name}, your community already launched ${token?.ticker ?? "your coin"}.
                Claim your Streamcoin page to verify it is you and connect any supported
                Pump.fun creator fee routing.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link href="/#dashboard" className="back-link">
          Back to all tokens
        </Link>
      </div>
    </div>
  );
}
