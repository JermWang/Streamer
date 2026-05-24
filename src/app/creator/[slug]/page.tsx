export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { LegalDisclaimer } from "@/components/ui/LegalDisclaimer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricsPanel } from "@/components/ui/MetricsPanel";
import { CreatorProofNudge } from "@/components/ui/SocialProof";
import type { TokenMetricsSnapshot } from "@/types/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCreatorData(slug: string) {
  const supabase = createAdminClient();
  const { data: creator } = await supabase
    .from("creators")
    .select("*, community_tokens(*)")
    .eq("slug", slug)
    .single();
  return creator;
}

async function getLatestMetrics(tokenId: string): Promise<TokenMetricsSnapshot | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("token_metrics_snapshots")
    .select()
    .eq("token_id", tokenId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

function shortAddr(addr: string): string {
  return addr.slice(0, 4) + "…" + addr.slice(-4);
}

export default async function CreatorPage({ params }: PageProps) {
  const { slug } = await params;
  const creator = await getCreatorData(slug);

  if (!creator) notFound();

  const token = creator.community_tokens?.[0] ?? null;
  const isVerified =
    creator.status === "CREATOR_VERIFIED" || creator.status === "OFFICIAL_PARTNER";
  const metrics = token ? await getLatestMetrics(token.id) : null;
  const twitterHandle = creator.primary_handle?.replace("@", "") ?? slug;

  return (
    <div className="page">
      {/* Profile hero strip */}
      <div className="profile-hero">
        <div className="profile-avatar">
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "var(--r-md)",
              overflow: "hidden",
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://unavatar.io/twitter/${twitterHandle}`}
              alt={creator.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        <div className="profile-id">
          <div className="profile-name">
            {creator.name}
            <StatusBadge status={isVerified ? creator.status : token?.launch_status ?? "DRAFT"} />
          </div>
          <div className="profile-meta">
            {token && (
              <span className="profile-ticker">${token.ticker}</span>
            )}
            {creator.primary_handle && (
              <>
                <span style={{ color: "var(--t4)" }}>·</span>
                <span className="profile-handle">{creator.primary_handle}</span>
              </>
            )}
            {creator.platform && (
              <>
                <span style={{ color: "var(--t4)" }}>·</span>
                <span>{creator.platform}</span>
              </>
            )}
            {token?.mint_address && (
              <>
                <span style={{ color: "var(--t4)" }}>·</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--t2)",
                  }}
                >
                  {shortAddr(token.mint_address)}
                </span>
              </>
            )}
          </div>
          {token?.description && (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                color: "var(--t2)",
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              {token.description}
            </div>
          )}
        </div>

        <div className="profile-actions">
          {token?.pump_url && (
            <a
              href={token.pump_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Pump.fun ↗
            </a>
          )}
          {!isVerified && (
            <Link href={`/claim/${creator.slug}`} className="btn btn-primary">
              Claim your coin →
            </Link>
          )}
        </div>
      </div>

      {/* Disclaimer above the fold for unverified */}
      {!isVerified && (
        <LegalDisclaimer
          creatorName={creator.name}
          verified={false}
          className="mb-16"
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          marginTop: 24,
        }}
      >
        <div>
          {/* Tabs */}
          <div className="tabs">
            <button className="tab active">Overview</button>
            <button className="tab" disabled style={{ opacity: 0.5 }}>
              Holders
            </button>
            <button className="tab" disabled style={{ opacity: 0.5 }}>
              Trades
            </button>
            <button className="tab" disabled style={{ opacity: 0.5 }}>
              Verification
            </button>
          </div>

          {/* Metrics / Chart Card */}
          {token ? (
            <MetricsPanel
              metrics={metrics}
              mintAddress={token.mint_address}
              pumpUrl={token.pump_url}
              chartUrl={token.chart_url}
            />
          ) : (
            <div className="chart-card">
              <div
                style={{
                  height: 160,
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  color: "var(--t3)",
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ marginBottom: 6 }}>No token drafted yet</div>
                  <div style={{ fontSize: 11.5, color: "var(--t4)" }}>
                    A community token for {creator.name} has not been launched yet.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Token details */}
          {token && (
            <div className="section" style={{ marginTop: 24 }}>
              <div className="section-head">
                <div className="section-title">Token Details</div>
              </div>
              <div className="module">
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      fontSize: 13,
                    }}
                  >
                    {[
                      ["Name", token.name],
                      ["Ticker", `$${token.ticker}`],
                      [
                        "Mint",
                        token.mint_address
                          ? shortAddr(token.mint_address)
                          : "Not yet attached",
                      ],
                      ["Platform", creator.platform ?? "—"],
                      ["Launch Provider", token.launch_provider ?? "Pump.fun"],
                      [
                        "Affiliation",
                        isVerified ? "Creator Claimed" : "Unofficial Community Token",
                      ],
                      [
                        "Creator Fee Wallet",
                        token.creator_fee_wallet
                          ? `…${token.creator_fee_wallet.slice(-8)}`
                          : "Not configured",
                      ],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: "1px solid var(--border-faint)",
                        }}
                      >
                        <span style={{ color: "var(--t3)" }}>{k}</span>
                        <span
                          style={{
                            color: "var(--t1)",
                            fontFamily:
                              k === "Mint" || k === "Creator Fee Wallet"
                                ? "var(--font-mono)"
                                : "inherit",
                            fontSize: 12.5,
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Claim / Verified module */}
          {isVerified ? (
            <div className="module" style={{ borderColor: "rgba(43,244,154,0.25)" }}>
              <div className="module-head">
                <div className="module-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  Verified Creator
                </div>
                <StatusBadge status={creator.status} />
              </div>
              <div className="module-body">
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12.5,
                    color: "var(--t2)",
                    lineHeight: 1.5,
                  }}
                >
                  This page is controlled by the verified creator. Creator fees route
                  to their on-chain wallet where supported by the launch provider.
                </p>
                <LegalDisclaimer creatorName={creator.name} verified={true} />
              </div>
            </div>
          ) : (
            <div className="claim-cta">
              <h4>Your community already built this.</h4>
              <p>
                They launched the coin and organized the momentum — the last step
                is for {creator.name} to claim the fees and, if they want, add
                Pump.fun as another platform to stream to.
              </p>
              <Link
                href={`/claim/${creator.slug}`}
                className="btn btn-primary btn-sm btn-flex"
              >
                Claim your coin →
              </Link>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  color: "var(--t3)",
                }}
              >
                Takes ~5 min · works alongside Twitch, Kick, YouTube
              </div>
            </div>
          )}

          {/* Social proof nudge for unverified creators */}
          {!isVerified && <CreatorProofNudge />}

          {/* Claim status note */}
          {creator.status === "CLAIM_REQUESTED" && (
            <div
              className="disclaimer"
              style={{ background: "var(--cyan-soft)", borderColor: "rgba(92,225,255,0.2)" }}
            >
              <div
                className="disclaimer-icon"
                style={{ background: "rgba(92,225,255,0.15)", color: "var(--cyan)" }}
              >
                ◆
              </div>
              <div className="disclaimer-text">
                A claim request is <strong style={{ color: "var(--cyan)" }}>pending review</strong> for
                this creator.
              </div>
            </div>
          )}

          {/* Quick links */}
          {token && (
            <div className="module">
              <div className="module-head">
                <div className="module-title">Links</div>
              </div>
              <div className="module-body" style={{ padding: 8 }}>
                {[
                  token.pump_url
                    ? { label: "Pump.fun page", href: token.pump_url, sub: "pump.fun token" }
                    : null,
                  token.chart_url
                    ? { label: "DexScreener chart", href: token.chart_url, sub: "Live chart" }
                    : token.mint_address
                    ? {
                        label: "DexScreener chart",
                        href: `https://dexscreener.com/solana/${token.mint_address}`,
                        sub: "Metrics unavailable",
                      }
                    : null,
                  creator.platform_url
                    ? {
                        label: `${creator.platform} channel`,
                        href: creator.platform_url,
                        sub: creator.primary_handle ?? creator.name,
                      }
                    : null,
                ]
                  .filter(Boolean)
                  .map((l) => (
                    <a
                      key={l!.label}
                      href={l!.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 7,
                        fontSize: 13,
                        color: "var(--t1)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.background =
                          "var(--bg-2)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.background = "none")
                      }
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{l!.label}</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--t3)",
                            fontFamily: "var(--font-mono)",
                            marginTop: 1,
                          }}
                        >
                          {l!.sub}
                        </div>
                      </div>
                      <span style={{ color: "var(--t3)", fontSize: 11 }}>↗</span>
                    </a>
                  ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link
          href="/"
          style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}
        >
          ← Back to all tokens
        </Link>
      </div>
    </div>
  );
}
