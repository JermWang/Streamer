export const dynamic = "force-dynamic";

import {
  LandingScreen,
  type LandingCreator,
  type LandingEvent,
} from "@/components/landing/LandingScreen";
import { MainCoinCard } from "@/components/ui/MainCoinCard";
import { SocialProof } from "@/components/ui/SocialProof";
import { TokenCard } from "@/components/ui/TokenCard";
import { TwoPaths } from "@/components/ui/TwoPaths";
import {
  fetchDexscreenerMetrics,
  getDexscreenerUrl,
  getPumpFunUrl,
} from "@/lib/metrics/dexscreener";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Creator, CommunityToken } from "@/types/db";

interface CreatorWithToken extends Creator {
  community_tokens: CommunityToken[];
}

async function getCreatorsWithTokens(filter?: string): Promise<CreatorWithToken[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("creators")
    .select("*, community_tokens(*)")
    .order("name", { ascending: true });

  if (filter === "verified") {
    query = query.in("status", ["CREATOR_VERIFIED", "OFFICIAL_PARTNER"]);
  } else if (filter === "unclaimed") {
    query = query.in("status", ["UNCLAIMED", "CLAIM_REQUESTED"]);
  }

  const { data, error } = await query.limit(50);
  if (error) {
    console.error("Error fetching creators:", error.message);
    return [];
  }

  return (data as CreatorWithToken[]) ?? [];
}

async function getPendingClaimCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("claim_requests")
    .select("id", { count: "exact", head: true })
    .in("status", ["PENDING", "NEEDS_MORE_PROOF"]);

  if (error) {
    console.error("Error fetching pending claims:", error.message);
    return 0;
  }

  return count ?? 0;
}

async function getMainCoinData() {
  const mintAddress = process.env.NEXT_PUBLIC_STREAMER_MINT_ADDRESS?.trim() ?? "";
  const pumpUrl =
    process.env.NEXT_PUBLIC_STREAMER_PUMP_URL?.trim() ||
    (mintAddress ? getPumpFunUrl(mintAddress) : "");
  const chartUrl = mintAddress ? getDexscreenerUrl(mintAddress) : "";
  const metrics = mintAddress ? await fetchDexscreenerMetrics(mintAddress) : null;

  return { mintAddress, pumpUrl, chartUrl, metrics };
}

interface HomePageProps {
  searchParams: Promise<{ filter?: string }>;
}

const FILTERS = [
  { key: "", label: "All" },
  { key: "unclaimed", label: "Awaiting Claim" },
  { key: "verified", label: "Verified" },
];

function platformLabel(platform: Creator["platform"]) {
  if (!platform) return "Community";
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

function avatarUrl(creator: Creator, token?: CommunityToken) {
  if (creator.avatar_url) return creator.avatar_url;
  if (token?.image_url) return token.image_url;

  const handle = (creator.primary_handle ?? creator.slug)
    .replace(/^@/, "")
    .replace(/[^a-zA-Z0-9_]/g, "");
  return `https://unavatar.io/twitter/${handle}`;
}

function relativeTimeLabel(value: string | null | undefined) {
  if (!value) return "indexed";

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "indexed";

  const seconds = Math.max(1, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function toLandingCreators(creators: CreatorWithToken[]): LandingCreator[] {
  return creators.map((creator) => {
    const token = creator.community_tokens?.[0];

    return {
      id: creator.id,
      name: creator.name,
      slug: creator.slug,
      handle: handleLabel(creator),
      platform: platformLabel(creator.platform),
      imageUrl: avatarUrl(creator, token),
      ticker:
        token?.ticker ??
        creator.slug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase(),
      creatorStatus: creator.status,
      tokenStatus: token?.launch_status ?? "DRAFT",
      hasMint: Boolean(token?.mint_address),
    };
  });
}

function toLandingEvents(creators: CreatorWithToken[]): LandingEvent[] {
  const events: LandingEvent[] = [];

  for (const creator of creators) {
    const token = creator.community_tokens?.[0];
    if (!token) continue;

    if (token.mint_address) {
      events.push({
        type: "launch",
        ticker: token.ticker,
        what: `${creator.name} community token live`,
        when: relativeTimeLabel(token.launched_at ?? token.updated_at ?? token.created_at),
      });
    } else {
      events.push({
        type: "milestone",
        ticker: token.ticker,
        what: `${creator.name} token drafted`,
        when: relativeTimeLabel(token.created_at),
      });
    }

    if (
      creator.status === "CREATOR_VERIFIED" ||
      creator.status === "OFFICIAL_PARTNER"
    ) {
      events.push({
        type: "verify",
        ticker: token.ticker,
        what: `${creator.name} verified`,
        when: relativeTimeLabel(creator.verified_at ?? creator.updated_at),
      });
    }

    if (creator.status === "CLAIM_REQUESTED" || token.launch_status === "CLAIM_REQUESTED") {
      events.push({
        type: "claim",
        ticker: token.ticker,
        what: `${creator.name} claim in review`,
        when: relativeTimeLabel(creator.updated_at),
      });
    }
  }

  return events.slice(0, 12);
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { filter } = await searchParams;
  const creators = await getCreatorsWithTokens(filter);
  const [allCreators, pendingClaimCount, mainCoin] = await Promise.all([
    filter ? getCreatorsWithTokens() : Promise.resolve(creators),
    getPendingClaimCount(),
    getMainCoinData(),
  ]);

  const liveCount = allCreators.filter(
    (creator) => creator.community_tokens?.[0]?.mint_address
  ).length;
  const verifiedCount = allCreators.filter(
    (creator) =>
      creator.status === "CREATOR_VERIFIED" ||
      creator.status === "OFFICIAL_PARTNER"
  ).length;
  const unclaimedCount = allCreators.filter(
    (creator) =>
      creator.status === "UNCLAIMED" ||
      creator.status === "CLAIM_REQUESTED"
  ).length;
  const hasCreators = allCreators.length > 0;
  return (
    <>
      <LandingScreen
        creators={toLandingCreators(allCreators)}
        events={toLandingEvents(allCreators)}
        claimHref="#how-it-works"
        featuredSlug="adin-ross"
        stats={{
          totalCreators: allCreators.length,
          liveTokens: liveCount,
          verifiedCreators: verifiedCount,
          pendingClaims: pendingClaimCount,
        }}
      />

      <div id="dashboard" className="page">
        <MainCoinCard
          pumpUrl={mainCoin.pumpUrl}
          mintAddress={mainCoin.mintAddress}
          chartUrl={mainCoin.chartUrl}
          metrics={mainCoin.metrics}
        />

        <TwoPaths />

        <SocialProof />

        <div className="page-grid">
          <div>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 18,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {FILTERS.map(({ key, label }) => (
                <a
                  key={key}
                  href={key ? `?filter=${key}#dashboard` : "/#dashboard"}
                  className={`chip-filter ${(filter ?? "") === key ? "active" : ""}`}
                >
                  {label}
                  <span className="count">
                    {key === ""
                      ? allCreators.length
                      : key === "verified"
                        ? verifiedCount
                        : unclaimedCount}
                  </span>
                </a>
              ))}
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: "var(--t3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {creators.length} result{creators.length !== 1 ? "s" : ""}
              </div>
            </div>

            {!hasCreators ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "64px 24px",
                  color: "var(--t3)",
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 8, color: "var(--t2)" }}>
                  No creators yet
                </div>
                <div style={{ fontSize: 13 }}>
                  Run{" "}
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--bg-2)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 12,
                      color: "var(--accent)",
                    }}
                  >
                    npm run seed
                  </code>{" "}
                  to add sample creators, or use the{" "}
                  <a href="/admin" style={{ color: "var(--accent)" }}>
                    Admin dashboard
                  </a>
                  .
                </div>
              </div>
            ) : creators.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: "var(--t3)",
                }}
              >
                <div style={{ fontSize: 14 }}>No creators match this filter.</div>
              </div>
            ) : (
              <div className="token-grid">
                {creators.map((creator) => {
                  const token = creator.community_tokens?.[0];
                  if (!token) {
                    return (
                      <div
                        key={creator.id}
                        className="token-card"
                        style={{ cursor: "default" }}
                      >
                        <div className="tc-head">
                          <div
                            className="avatar av-default"
                            style={{ width: 40, height: 40 }}
                          >
                            {creator.name.charAt(0)}
                          </div>
                          <div className="tc-id">
                            <div className="tc-name">{creator.name}</div>
                            <div
                              className="tc-ticker"
                              style={{ color: "var(--t3)", fontSize: 11 }}
                            >
                              No token drafted
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <TokenCard key={creator.id} creator={creator} token={token} />
                  );
                })}
              </div>
            )}
          </div>

          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "sticky",
              top: 80,
              alignSelf: "start",
            }}
          >
            <div id="how-it-works" className="module">
              <div className="module-head">
                <div className="module-title">How this works</div>
              </div>
              <div
                className="module-body"
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12.5,
                    color: "var(--t2)",
                    lineHeight: 1.6,
                  }}
                >
                  Streaming communities are organically launching{" "}
                  <strong style={{ color: "var(--amber)" }}>
                    community tokens
                  </strong>{" "}
                  on Solana for the creators they love. The momentum is grassroots:
                  fans building around creators they believe in.
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12.5,
                    color: "var(--t2)",
                    lineHeight: 1.6,
                  }}
                >
                  $STREAMER is the easy routing layer:{" "}
                  <strong style={{ color: "var(--accent)" }}>
                    every live coin links straight to Pump.fun
                  </strong>{" "}
                  once launched. Creators claim eligible fees through Pump.fun, and
                  this site keeps the community page, proof, and raid links organized.
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11.5,
                    color: "var(--t4)",
                    lineHeight: 1.5,
                  }}
                >
                  All tokens are unofficial unless marked Verified. Not financial advice.
                </p>
              </div>
            </div>

            <div className="claim-cta">
              <h4>Your community already did the hard part.</h4>
              <p>
                They built the token and the momentum. Once the Pump.fun coin is
                live, this page points people directly to that coin and explains
                how creators verify and claim eligible fees through Pump.fun.
              </p>
              <a href="#how-it-works" className="btn btn-primary btn-sm btn-flex">
                How it works -&gt;
              </a>
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--t3)" }}>
                Pump.fun links will go directly to each live coin once added
              </div>
            </div>
          </aside>
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--border)",
            fontSize: 11.5,
            color: "var(--t4)",
            textAlign: "center",
          }}
        >
          $STREAMER - claim your community coin before someone else does - all
          tokens unofficial unless marked Verified - not financial advice
        </div>
      </div>
    </>
  );
}
