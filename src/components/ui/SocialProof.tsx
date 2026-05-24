"use client";

// All content sourced from real articles and verified social posts.
// Source links are included on each card so visitors can verify.
//
// Sources:
// - https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch
// - https://www.21shares.com/en-eu/insights/tokenized-attention-pump-fun-and-the-rise-of-creator-capital-markets
// - https://x.com/Pumpfun/status/1942947267436056740

interface ProofCard {
  type: "tweet" | "stat" | "news";
  name: string;
  handle?: string;
  avatarInitial: string;
  avatarBg: string; // inline bg colour
  text: string;
  sub?: string;     // secondary line (earnings, etc.)
  timestamp: string;
  sourceLabel: string;
  sourceUrl: string;
  isVerified?: boolean;
  accentColor?: string;
}

const CARDS: ProofCard[] = [
  {
    type: "tweet",
    name: "Pump.fun",
    handle: "@pumpdotfun",
    avatarInitial: "P",
    avatarBg: "linear-gradient(135deg,#2BF49A 0%,#0e9e5e 100%)",
    text: "Our plan is to kill Facebook, TikTok, and Twitch. On Solana.",
    timestamp: "Jul 2025",
    sourceLabel: "x.com/Pumpfun",
    sourceUrl: "https://x.com/Pumpfun/status/1942947267436056740",
    isVerified: true,
    accentColor: "var(--accent)",
  },
  {
    type: "tweet",
    name: "Michael \"BunnyFuFuu\" Kurylo",
    handle: "@BunnyFuFuu",
    avatarInitial: "B",
    avatarBg: "linear-gradient(135deg,#9C82F0 0%,#5b3fcf 100%)",
    text: "Retired pro player, joined Pump.fun — earned $130,000 in his first 3 days streaming. Down to $29K over the next 3 months as the hype settled.",
    sub: "$130K in 3 days",
    timestamp: "2024",
    sourceLabel: "Decrypt",
    sourceUrl: "https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch",
    accentColor: "var(--purple)",
  },
  {
    type: "tweet",
    name: "Mike · Bagwork",
    handle: "@bagwork",
    avatarInitial: "M",
    avatarBg: "linear-gradient(135deg,#F5A524 0%,#c47a0a 100%)",
    text: "\"The best few days of my life.\" After a viral stream, Bagwork earned $83,000 in just 2 days — their token pumped 2,000% at peak.",
    sub: "$83K in 2 days · 2,000% pump",
    timestamp: "2024",
    sourceLabel: "Decrypt",
    sourceUrl: "https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch",
    accentColor: "var(--amber)",
  },
  {
    type: "tweet",
    name: "Jytol",
    handle: "@jytol",
    avatarInitial: "J",
    avatarBg: "linear-gradient(135deg,#5CE1FF 0%,#0d8aaa 100%)",
    text: "\"The approach that Pump is taking to this is phenomenal… I'm such a believer in this. I can see it happening.\"",
    timestamp: "2024",
    sourceLabel: "Decrypt",
    sourceUrl: "https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch",
    accentColor: "var(--cyan)",
  },
  {
    type: "stat",
    name: "Pump.fun Platform",
    avatarInitial: "$",
    avatarBg: "linear-gradient(135deg,#2BF49A 0%,#042418 100%)",
    text: "$4,000,000+ paid out to creators in a single September day — verified on-chain via Dune Analytics.",
    sub: "Single-day creator payout record",
    timestamp: "Sep 2024",
    sourceLabel: "Decrypt · Dune",
    sourceUrl: "https://decrypt.co/337872/pump-funs-new-fee-model-hands-out-2m-to-creators-in-first-24-hours",
    accentColor: "var(--accent)",
  },
  {
    type: "news",
    name: "Decrypt",
    handle: "@decryptmedia",
    avatarInitial: "D",
    avatarBg: "linear-gradient(135deg,#FF5A5F 0%,#a01c20 100%)",
    text: "\"Creator Capital Markets: How Pump.fun Changed Streaming in 2025\" — Traditional streamers like BunnyFuFuu earned more in days than months on Twitch.",
    timestamp: "2025",
    sourceLabel: "decrypt.co",
    sourceUrl: "https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch",
    accentColor: "var(--red)",
  },
  {
    type: "stat",
    name: "Community on Pump.fun",
    avatarInitial: "K",
    avatarBg: "linear-gradient(135deg,#ff6b35 0%,#8b0000 100%)",
    text: "10+ separate community-created \"Kai Cenat\" coins exist on Pump.fun right now — fans launching tokens before the creator even knows.",
    sub: "Unofficial · community-created",
    timestamp: "live",
    sourceLabel: "pump.fun",
    sourceUrl: "https://pump.fun/coin/ECZWrJr7YLXvLpi7MRytPaTVoxUZGibTXTvj5PHSWVFP",
    accentColor: "var(--amber)",
  },
  {
    type: "news",
    name: "21Shares Research",
    avatarInitial: "21",
    avatarBg: "linear-gradient(135deg,#9C82F0 0%,#1a0a3a 100%)",
    text: "\"Tokenized attention: Pump.fun and the rise of Creator Capital Markets\" — On Twitch or Kick, fans donate with no financial return. On Pump.fun, donations become an asset.",
    timestamp: "2025",
    sourceLabel: "21shares.com",
    sourceUrl: "https://www.21shares.com/en-eu/insights/tokenized-attention-pump-fun-and-the-rise-of-creator-capital-markets",
    accentColor: "var(--purple)",
  },
];

function XIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function Card({ card }: { card: ProofCard }) {
  return (
    <a
      href={card.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 18px",
        minWidth: 300,
        maxWidth: 340,
        flexShrink: 0,
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        position: "relative",
        isolation: "isolate",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          card.accentColor ?? "var(--border-strong)";
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--panel-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "var(--border)";
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--panel)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: card.avatarBg,
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {card.avatarInitial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--t1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {card.name}
            {card.isVerified && (
              <span
                style={{
                  color: card.accentColor ?? "var(--accent)",
                  marginLeft: 4,
                  fontSize: 11,
                }}
              >
                ✓
              </span>
            )}
          </div>
          {card.handle && (
            <div
              style={{
                fontSize: 11,
                color: "var(--t4)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {card.handle}
            </div>
          )}
        </div>
        {/* Type badge */}
        <div
          style={{
            fontSize: 10,
            color: "var(--t4)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {card.type === "tweet" || card.type === "news" ? (
            <XIcon />
          ) : (
            <span style={{ fontSize: 12 }}>◆</span>
          )}
        </div>
      </div>

      {/* Body */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "var(--t2)",
          lineHeight: 1.55,
          flex: 1,
        }}
      >
        {card.text}
      </p>

      {/* Sub stat */}
      {card.sub && (
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: card.accentColor ?? "var(--accent)",
            fontFamily: "var(--font-mono)",
            background: "rgba(43,244,154,0.07)",
            border: `1px solid ${card.accentColor ?? "var(--accent)"}22`,
            borderRadius: 6,
            padding: "3px 8px",
            alignSelf: "flex-start",
          }}
        >
          {card.sub}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border-faint)",
          paddingTop: 10,
          marginTop: "auto",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--t4)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {card.timestamp}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--t4)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          via {card.sourceLabel} ↗
        </span>
      </div>
    </a>
  );
}

export function SocialProof() {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            animation: "pulse 2s infinite",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--t3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Proof the movement already exists — we&apos;re building the infrastructure
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: "var(--border-faint)",
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: "var(--t4)",
            whiteSpace: "nowrap",
          }}
        >
          sourced · verified
        </span>
      </div>

      {/* Scrolling card strip */}
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {CARDS.map((card) => (
          <Card key={card.name + card.timestamp} card={card} />
        ))}
      </div>

      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          marginTop: 12,
          background: "var(--border-faint)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {[
          { val: "$4M+", label: "paid out in a single day", color: "var(--accent)" },
          { val: "$130K", label: "BunnyFuFuu earned in 3 days", color: "var(--purple)" },
          { val: "$83K", label: "Bagwork earned in 2 days", color: "var(--amber)" },
          { val: "10+", label: "Kai Cenat coins on pump.fun", color: "var(--cyan)" },
        ].map(({ val, label, color }) => (
          <div
            key={val}
            style={{
              background: "var(--panel)",
              padding: "12px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color,
                fontFamily: "var(--font-mono)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {val}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--t4)",
                marginTop: 4,
                lineHeight: 1.3,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 10.5,
          color: "var(--t4)",
          textAlign: "right",
        }}
      >
        Sources:{" "}
        <a
          href="https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--t3)", textDecoration: "none" }}
        >
          Decrypt
        </a>
        {" · "}
        <a
          href="https://www.21shares.com/en-eu/insights/tokenized-attention-pump-fun-and-the-rise-of-creator-capital-markets"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--t3)", textDecoration: "none" }}
        >
          21Shares
        </a>
        {" · "}
        <a
          href="https://x.com/Pumpfun"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--t3)", textDecoration: "none" }}
        >
          @pumpdotfun
        </a>
      </div>
    </div>
  );
}

// ─── Compact sidebar nudge for creator pages ───────────────────────────────
const NUDGE_FACTS = [
  {
    stat: "$130K",
    color: "var(--purple)",
    text: "BunnyFuFuu earned in 3 days after joining Pump.fun",
    url: "https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch",
  },
  {
    stat: "$83K",
    color: "var(--amber)",
    text: "Bagwork earned in 2 days from a single viral stream",
    url: "https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch",
  },
  {
    stat: "$4M+",
    color: "var(--accent)",
    text: "paid to creators in a single day — verified on-chain",
    url: "https://decrypt.co/337872/pump-funs-new-fee-model-hands-out-2m-to-creators-in-first-24-hours",
  },
];

export function CreatorProofNudge() {
  return (
    <div
      className="module"
      style={{ borderColor: "rgba(43,244,154,0.12)" }}
    >
      <div className="module-head">
        <div
          className="module-title"
          style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ color: "var(--accent)", fontSize: 10 }}>●</span>
          Creators are already earning
        </div>
      </div>
      <div
        className="module-body"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {NUDGE_FACTS.map((f) => (
          <a
            key={f.stat}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              padding: "6px 8px",
              borderRadius: 7,
              background: "var(--bg-2)",
              border: "1px solid var(--border-faint)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 700,
                color: f.color,
                flexShrink: 0,
                minWidth: 52,
              }}
            >
              {f.stat}
            </span>
            <span
              style={{
                fontSize: 11.5,
                color: "var(--t3)",
                lineHeight: 1.4,
              }}
            >
              {f.text}
            </span>
            <span style={{ color: "var(--t4)", fontSize: 10, marginLeft: "auto", flexShrink: 0 }}>
              ↗
            </span>
          </a>
        ))}
        <div
          style={{
            fontSize: 10.5,
            color: "var(--t4)",
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          Your community built the momentum. Claiming takes ~5 min — then optionally add Pump.fun as another platform you stream to.
        </div>
      </div>
    </div>
  );
}
