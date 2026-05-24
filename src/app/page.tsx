export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { TokenCard } from "@/components/ui/TokenCard";
import { SocialProof } from "@/components/ui/SocialProof";
import { TwoPaths } from "@/components/ui/TwoPaths";
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

interface HomePageProps {
  searchParams: Promise<{ filter?: string }>;
}

const FILTERS = [
  { key: "", label: "All" },
  { key: "unclaimed", label: "Awaiting Claim" },
  { key: "verified", label: "Verified" },
];

export default async function HomePage({ searchParams }: HomePageProps) {
  const { filter } = await searchParams;
  const creators = await getCreatorsWithTokens(filter);

  const allCreators = await (async () => {
    if (filter) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("creators")
        .select("*, community_tokens(*)")
        .order("name", { ascending: true })
        .limit(50);
      return (data as CreatorWithToken[]) ?? [];
    }
    return creators;
  })();

  const liveCount = allCreators.filter(
    (c) => c.community_tokens?.[0]?.mint_address
  ).length;
  const verifiedCount = allCreators.filter(
    (c) => c.status === "CREATOR_VERIFIED" || c.status === "OFFICIAL_PARTNER"
  ).length;
  const unclaimedCount = allCreators.filter(
    (c) =>
      c.status === "UNCLAIMED" ||
      c.status === "CLAIM_REQUESTED"
  ).length;

  const hasCreators = allCreators.length > 0;

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div>
          <h1 className="hero-title">
            Your community already
            <br />
            <em>launched a coin in your name.</em>
          </h1>
          <p className="hero-sub">
            Streamer communities are organically launching coins on Solana for the
            creators they love. They built the momentum — the last step is for
            the creator to claim the fees and, if they want, add Pump.fun as
            another platform they stream to.
          </p>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--t3)",
              lineHeight: 1.6,
              marginTop: 10,
              marginBottom: 16,
              maxWidth: 460,
              padding: "10px 14px",
              background: "var(--bg-2)",
              borderRadius: 8,
              borderLeft: "2px solid var(--accent)",
            }}
          >
            The community already did the hard part. Claiming takes 5 minutes —
            and it works alongside Twitch, Kick, or YouTube, not instead of them.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/" className="btn btn-primary btn-lg">
              Browse Coins →
            </a>
            <a href="/admin" className="btn btn-secondary btn-lg">
              Claim Your Page
            </a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="label">Creators</div>
            <div className="val">{allCreators.length}</div>
          </div>
          <div className="hero-stat">
            <div className="label">Live Tokens</div>
            <div className="val">{liveCount}</div>
          </div>
          <div className="hero-stat">
            <div className="label">Verified</div>
            <div className="val accent">{verifiedCount}</div>
          </div>
          <div className="hero-stat">
            <div className="label">Unclaimed</div>
            <div className="val" style={{ color: "var(--cyan)" }}>{unclaimedCount}</div>
          </div>
        </div>
      </div>

      <TwoPaths />

      <SocialProof />

      <div className="page-grid">
        <div>
          {/* Filter chips */}
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
                href={key ? `?filter=${key}` : "/"}
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

          {/* Token grid */}
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
                return <TokenCard key={creator.id} creator={creator} token={token} />;
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
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
          {/* About */}
          <div className="module">
            <div className="module-head">
              <div className="module-title">How this works</div>
            </div>
            <div className="module-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--t2)", lineHeight: 1.6 }}>
                Streaming communities are organically launching{" "}
                <strong style={{ color: "var(--amber)" }}>community tokens</strong>{" "}
                on Solana for the creators they love. The momentum is grassroots —
                fans building around creators they believe in.
              </p>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--t2)", lineHeight: 1.6 }}>
                Streamcoin is the last step:{" "}
                <strong style={{ color: "var(--accent)" }}>the creator claims the fees</strong>{" "}
                and, if they want, adds Pump.fun as a platform they stream to —
                all without leaving Twitch or Kick.
              </p>
              <p style={{ margin: 0, fontSize: 11.5, color: "var(--t4)", lineHeight: 1.5 }}>
                All tokens are unofficial unless marked Verified. Not financial advice.
              </p>
            </div>
          </div>

          {/* Claim CTA */}
          <div className="claim-cta">
            <h4>Your community already did the hard part.</h4>
            <p>
              They built the token and the momentum. The last step is yours —
              claim the fees and optionally add Pump.fun as another platform
              you stream to. Takes 5 minutes.
            </p>
            <a href="/admin" className="btn btn-primary btn-sm btn-flex">
              Claim your page →
            </a>
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--t3)" }}>
              Works alongside Twitch, Kick, YouTube — not instead of them
            </div>
          </div>
        </aside>
      </div>

      {/* Footer note */}
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
        streamcoin.io — claim your community coin before someone else does ·
        all tokens unofficial unless marked Verified · not financial advice
      </div>
    </div>
  );
}
