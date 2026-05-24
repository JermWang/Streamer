// TwoPaths — contrasts the reactive pump.fun model vs the proactive streamcoin model.
// This is the core positioning argument: claim while at peak, not after being banned.

const REACTIVE = [
  {
    step: "01",
    label: "Community launches a coin for you",
    sub: "Organic grassroots momentum on Solana",
  },
  {
    step: "02",
    label: "Creator doesn't know it exists yet",
    sub: "No one reached out — it just happened",
  },
  {
    step: "03",
    label: "Fees accumulate with no claimant",
    sub: "The community built it, but the creator misses out",
  },
  {
    step: "04",
    label: "Moment passes without the creator",
    sub: "Hype fades before the creator ever showed up",
  },
];

const PROACTIVE = [
  {
    step: "01",
    label: "Community organically launches a coin for you",
    sub: "They believe in you enough to build it themselves",
  },
  {
    step: "02",
    label: "You claim the fees — 5 minutes",
    sub: "Verify identity, route earnings to your wallet",
  },
  {
    step: "03",
    label: "Optionally add Pump.fun as a stream platform",
    sub: "Alongside Twitch, Kick, YouTube — not instead of them",
  },
  {
    step: "04",
    label: "Community momentum becomes creator revenue",
    sub: "You show up for the community that already showed up for you",
  },
];

export function TwoPaths() {
  return (
    <div
      style={{
        margin: "0 0 32px",
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px 16px",
          borderBottom: "1px solid var(--border-faint)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--t3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          The problem with waiting
        </div>
        <div style={{ flex: 1, height: 1, background: "var(--border-faint)" }} />
        <div
          style={{
            fontSize: 11,
            color: "var(--t4)",
            fontFamily: "var(--font-mono)",
          }}
        >
          two paths
        </div>
      </div>

      {/* Two column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
        }}
      >
        {/* Left — without Streamcoin */}
        <div
          style={{
            borderRight: "1px solid var(--border-faint)",
            padding: "20px 24px 24px",
            background: "rgba(255,90,95,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                background: "rgba(255,90,95,0.12)",
                display: "grid",
                placeItems: "center",
                fontSize: 11,
                color: "var(--red)",
              }}
            >
              ✕
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--t2)",
              }}
            >
              Without claiming
            </span>
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--t3)",
              marginBottom: 18,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            &ldquo;The community builds the whole thing — but the creator never
            shows up to collect what their fans built for them.&rdquo;
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {REACTIVE.map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--red)",
                    opacity: 0.5,
                    flexShrink: 0,
                    marginTop: 2,
                    minWidth: 18,
                  }}
                >
                  {item.step}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--t2)",
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--t4)",
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — with Streamcoin */}
        <div
          style={{
            padding: "20px 24px 24px",
            background: "rgba(43,244,154,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                background: "var(--accent-soft)",
                display: "grid",
                placeItems: "center",
                fontSize: 11,
                color: "var(--accent)",
              }}
            >
              ✓
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent)",
              }}
            >
              With Streamcoin
            </span>
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--t3)",
              marginBottom: 18,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            &ldquo;The community did the work. The creator claims the fees and,
            if they want, adds Pump.fun as another platform — no one leaves
            Twitch.&rdquo;
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {PROACTIVE.map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--accent)",
                    opacity: 0.6,
                    flexShrink: 0,
                    marginTop: 2,
                    minWidth: 18,
                  }}
                >
                  {item.step}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--t1)",
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--t3)",
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div
        style={{
          padding: "14px 24px",
          borderTop: "1px solid var(--border-faint)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          background: "var(--bg-2)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: "var(--t2)",
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          The community organically organized itself. Streamcoin is just the
          last step — claiming what your fans already built for you and, if you
          want, adding Pump.fun as another place you stream.
        </p>
        <a
          href="/admin"
          className="btn btn-primary btn-sm"
          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Find & claim your coin →
        </a>
      </div>
    </div>
  );
}
