"use client";

import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { CreatorStatus, TokenLaunchStatus } from "@/types/db";

export interface LandingCreator {
  id: string;
  name: string;
  slug: string;
  handle: string;
  platform: string;
  imageUrl: string;
  ticker: string;
  creatorStatus: CreatorStatus;
  tokenStatus: TokenLaunchStatus;
  hasMint: boolean;
}

export interface LandingEvent {
  type: "launch" | "claim" | "verify" | "milestone" | "dispute" | "reward";
  ticker: string;
  what: string;
  when: string;
}

interface LandingScreenProps {
  creators: LandingCreator[];
  events: LandingEvent[];
  stats: {
    totalCreators: number;
    liveTokens: number;
    verifiedCreators: number;
    pendingClaims: number;
  };
  claimHref: string;
}

function useRecTimer() {
  const [seconds, setSeconds] = useState(8347);

  useEffect(() => {
    const start = Date.now() - 8347 * 1000;
    const id = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function ArrowRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PumpFunLogo() {
  return (
    <span className="pump-logo" aria-label="Pump.fun">
      <span className="pump-logo-mark" aria-hidden="true">
        <span />
      </span>
      <span className="pump-logo-text">pump.fun</span>
    </span>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-11a4 4 0 1 0 0-8m6 19v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Avatar({
  creator,
  size = 48,
  live = false,
}: {
  creator: LandingCreator;
  size?: number;
  live?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={`avatar av-default ${live ? "live" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {!imgFailed ? (
        <img
          src={creator.imageUrl}
          alt={creator.name}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{creator.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function WaveformViz({ bars = 56, height = 38 }: { bars?: number; height?: number }) {
  const [phase, setPhase] = useState(0);
  const data = useMemo(() => Array.from({ length: bars }, (_, i) => i), [bars]);

  useEffect(() => {
    const id = window.setInterval(() => setPhase((p) => p + 1), 90);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="wf" style={{ height }}>
      {data.map((i) => {
        const v = Math.abs(
          Math.sin(i * 0.5 + phase * 0.4) * 0.6 +
            Math.cos(i * 0.31 + phase * 0.27) * 0.4
        );
        const barHeight = Math.max(8, v * 100);
        return (
          <div
            key={i}
            className="wf-bar"
            style={{
              height: `${barHeight}%`,
              background: "var(--accent)",
              opacity: 0.35 + v * 0.5,
            }}
          />
        );
      })}
    </div>
  );
}

function MiniEventLog({ events }: { events: LandingEvent[] }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2800);
    return () => window.clearInterval(id);
  }, []);

  const safeEvents =
    events.length > 0
      ? events
      : [{ type: "milestone" as const, ticker: "INDEX", what: "awaiting first token event", when: "now" }];
  const offset = tick % safeEvents.length;
  const list = [...safeEvents.slice(offset), ...safeEvents.slice(0, offset)];

  return (
    <div className="mel">
      {list.slice(0, 4).map((event, i) => {
        const icons: Record<LandingEvent["type"], string> = {
          launch: "*",
          claim: "+",
          verify: "V",
          milestone: "^",
          dispute: "!",
          reward: "$",
        };
        const colors: Record<LandingEvent["type"], string> = {
          launch: "var(--purple)",
          claim: "var(--cyan)",
          verify: "var(--accent)",
          milestone: "var(--amber)",
          dispute: "var(--red)",
          reward: "var(--amber)",
        };

        return (
          <div key={`${tick}-${i}-${event.ticker}`} className="mel-row" style={{ opacity: 1 - i * 0.18 }}>
            <span className="mel-time">{["00:12", "00:34", "01:02", "02:18"][i]}</span>
            <span className="mel-icon" style={{ color: colors[event.type] }}>
              {icons[event.type]}
            </span>
            <span className="mel-tk">${event.ticker}</span>
            <span className="mel-what">{event.what}</span>
          </div>
        );
      })}
    </div>
  );
}

function HeroBroadcast({ creators, events, stats, claimHref }: LandingScreenProps) {
  const rec = useRecTimer();
  const featuredPool = useMemo(
    () => creators.filter((creator) => creator.hasMint && creator.tokenStatus !== "ARCHIVED"),
    [creators]
  );
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    if (featuredPool.length <= 1) return;
    const id = window.setInterval(() => {
      setFeaturedIndex((index) => (index + 1) % featuredPool.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [featuredPool.length]);

  const fallback = creators[0];
  const featured = featuredPool[featuredIndex % Math.max(featuredPool.length, 1)] ?? fallback;

  return (
    <div className="hero-bx">
      <div className="hbx-rack">
        <div className="rack-onair">
          <span className="rec-dot" />
          <span>ON AIR</span>
          <span className="rec-time">{rec}</span>
        </div>
        <div className="rack-tabs" aria-hidden="true" />
        <div className="rack-signal">
          <span>SIGNAL</span>
          <div className="bars">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>

      <div className="hbx-grid">
        <div className="hbx-left">
          <div className="hbx-platform-lockup">
            <PumpFunLogo />
            <span>community streamer onboarding layer</span>
          </div>
          <div className="hbx-kicker">
            <span className="kicker-line" />
            INDEPENDENT COMMUNITY HUB - BUILT AROUND PUMP.FUN STREAMING
          </div>
          <h1 className="hbx-title">
            <span>Pump.fun</span> <span className="grad">streamer coins.</span>
            <br />
            <span>Onboarded by the </span>
            <span className="hbx-title-em">community</span>
            <span>.</span>
          </h1>
          <p className="hbx-sub">
            We are not trying to replace Pump.fun. Streamcoin is the community layer
            focused on getting streamers into the Pump.fun economy: fans surface the
            coins, raid the live channel, and push creators to claim supported fees
            where the underlying launch provider allows it.
          </p>

          <div className="hbx-cta">
            <a className="btn btn-primary btn-lg" href="#dashboard">
              Open onboarding board <ArrowRightIcon />
            </a>
            <a className="btn btn-secondary btn-lg" href={claimHref}>
              How fee claims work
            </a>
          </div>

          <div className="hbx-kpis">
            <div className="hk">
              <div className="hk-v">{stats.totalCreators}</div>
              <div className="hk-l">Streamer pages</div>
            </div>
            <div className="hk">
              <div className="hk-v">{stats.liveTokens}</div>
              <div className="hk-l">Pump.fun tokens</div>
            </div>
            <div className="hk">
              <div className="hk-v" style={{ color: "var(--accent)" }}>
                {stats.verifiedCreators}
              </div>
              <div className="hk-l">Verified creators</div>
            </div>
            <div className="hk">
              <div className="hk-v" style={{ color: "var(--cyan)" }}>
                {stats.pendingClaims}
              </div>
              <div className="hk-l">Onboarding claims</div>
            </div>
          </div>
        </div>

        <div className="hbx-right">
          <div className="pwin">
            <div className="pwin-chrome">
              <div className="pw-rec">
                <span className="rec-dot" /> REC
              </div>
              <div className="pw-title">PREVIEW - featured token</div>
              <div className="pw-meta">
                <span className="pwm-k">RES</span>
                <span className="pwm-v">1080p</span>
                <span className="pwm-k">FPS</span>
                <span className="pwm-v">60</span>
              </div>
            </div>

            {featured ? (
              <div className="pwin-stage">
                <div className="pwin-stage-bg" key={featured.slug}>
                  <img src={featured.imageUrl} alt="" onError={(event) => (event.currentTarget.style.display = "none")} />
                  <div className="pwin-stage-overlay" />
                </div>
                <div className="pwin-stage-inner">
                  <div className="pwin-stage-top">
                    {featured.hasMint && <StatusBadge status="LIVE" />}
                    <StatusBadge status={featured.tokenStatus} />
                  </div>
                  <div className="pwin-stage-bottom">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar creator={featured} size={48} live={featured.hasMint} />
                      <div>
                        <div className="pwin-name">{featured.name}</div>
                        <div className="pwin-meta">
                          <span className="pwin-tk">${featured.ticker}</span>
                          <span style={{ color: "var(--t4)" }}>-</span>
                          <span>{featured.handle}</span>
                          <span style={{ color: "var(--t4)" }}>-</span>
                          <span>{featured.platform}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pwin-stage">
                <div className="pwin-stage-inner">
                  <div />
                  <div className="pwin-name">No creators indexed yet</div>
                </div>
              </div>
            )}

            <div className="pwin-waveform">
              <div className="pw-section-label">
                <span className="pw-led" />
                AUDIO - 48kHz - -6dB
              </div>
              <WaveformViz height={42} bars={64} />
              <div className="pw-section-label" style={{ justifyContent: "flex-end" }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--t3)", fontSize: 10 }}>
                  -inf dB ---------- 0 dB
                </span>
              </div>
            </div>

            <div className="pwin-log">
              <div className="pw-section-label">
                <span className="pw-led" style={{ background: "var(--cyan)" }} />
                LIVE EVENTS - $STREAMER indexer
                <span style={{ marginLeft: "auto", color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                  TX/s 1.2
                </span>
              </div>
              <MiniEventLog events={events} />
            </div>

            <div className="pwin-transport">
              <div className="ptr-btn">{"<<"}</div>
              <div className="ptr-btn play">{">"}</div>
              <div className="ptr-btn">[]</div>
              <div className="ptr-progress">
                <div className="ptr-fill" />
                <div className="ptr-thumb" />
              </div>
              <div className="ptr-time">{rec}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarqueeCard({ creator }: { creator: LandingCreator }) {
  return (
    <a className="m-card" href={`/creator/${creator.slug}`} title={`${creator.name} - $${creator.ticker}`}>
      <Avatar creator={creator} size={68} live={creator.hasMint} />
      <div className="m-name">{creator.name}</div>
      <div className="m-meta">
        <span className="m-tk">${creator.ticker}</span>
        <span className="m-dot">-</span>
        <span>{creator.platform}</span>
      </div>
      <div className="m-badge">
        <StatusBadge status={creator.tokenStatus} />
      </div>
    </a>
  );
}

export function LandingScreen(props: LandingScreenProps) {
  const marqueeCreators = props.creators.filter((creator) => creator.tokenStatus !== "ARCHIVED");
  const repeatedCreators = [...marqueeCreators, ...marqueeCreators, ...marqueeCreators];
  const tickerEvents =
    props.events.length > 0
      ? [...props.events, ...props.events]
      : [{ type: "milestone" as const, ticker: "INDEX", what: "awaiting first token event", when: "now" }];

  return (
    <section className="landing">
      <div className="land-aurora" aria-hidden="true">
        <div className="aurora a1" />
        <div className="aurora a2" />
        <div className="aurora a3" />
      </div>
      <div className="land-rays" aria-hidden="true" />

      <HeroBroadcast {...props} />

      {repeatedCreators.length > 0 && (
        <div className="land-marquee">
          <div className="marquee-fade-l" />
          <div className="marquee-fade-r" />
          <div className="marquee-track">
            {repeatedCreators.map((creator, index) => (
              <MarqueeCard key={`a-${creator.id}-${index}`} creator={creator} />
            ))}
          </div>
          <div className="marquee-track reverse">
            {[...repeatedCreators].reverse().map((creator, index) => (
              <MarqueeCard key={`b-${creator.id}-${index}`} creator={creator} />
            ))}
          </div>
        </div>
      )}

      <div className="land-ticker">
        <div className="ticker-label">
          <span className="pulse" />
          LIVE
        </div>
        <div className="ticker-track">
          <div className="ticker-inner">
            {tickerEvents.map((event, index) => (
              <span key={`${event.ticker}-${index}`} className="ticker-item">
                <span className={`ticker-icon fi-${event.type}`} />
                <span className="ticker-tk">${event.ticker}</span>
                <span className="ticker-what">{event.what}</span>
                <span className="ticker-when">{event.when}</span>
                <span className="ticker-sep">/</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="land-pillars">
        <div className="pillar">
          <div className="p-icon" style={{ background: "var(--purple-soft)", color: "var(--purple)" }}>
            <UsersIcon />
          </div>
          <div className="p-title">For Pump.fun communities</div>
          <p>
            Surface streamer coins already launched on Pump.fun, organize raids,
            and point creators to the fees and claim flow without pretending the
            token is official.
          </p>
        </div>
        <div className="pillar">
          <div className="p-icon" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            <ShieldIcon />
          </div>
          <div className="p-title">For streamers</div>
          <p>
            Verify identity, understand the Pump.fun coin in your name, and route
            creator fees where supported while keeping Twitch, Kick, and YouTube.
          </p>
        </div>
        <div className="pillar">
          <div className="p-icon" style={{ background: "var(--cyan-soft)", color: "var(--cyan)" }}>
            <ListIcon />
          </div>
          <div className="p-title">For everyone</div>
          <p>
            Streamcoin stays community-first: no fake metrics, no replacement pitch,
            no official claims without proof, and Pump.fun links stay front and center.
          </p>
        </div>
      </div>

      <div className="land-cta-strip">
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>
            Help streamers find what Pump.fun communities launched.
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)" }}>
            {props.stats.totalCreators} streamer pages - Pump.fun links, claim routing, and honest data
          </div>
        </div>
        <a className="btn btn-primary btn-lg" href="#dashboard">
          Open onboarding board <ArrowRightIcon />
        </a>
      </div>

      <footer className="land-footer">
        <div className="land-footer-inner">
          <div>
            <div className="brand" style={{ marginBottom: 8 }}>
              <span className="brand-logo brand-logo-footer">
                <img src="/streamer-logo.png?v=3" alt="$STREAMER" />
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--t3)", maxWidth: 380, lineHeight: 1.6 }}>
              Streamcoin is an independent community onboarding hub for streamer
              communities using Pump.fun. It does not issue, sell, or endorse any token.
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--t3)", lineHeight: 1.8 }}>
            All tokens shown are <strong style={{ color: "var(--amber)" }}>unofficial community tokens</strong> unless
            explicitly marked <strong style={{ color: "var(--accent)" }}>Verified</strong>.
            Not affiliated with, endorsed by, or connected to any creator unless marked Verified.
          </div>
        </div>
      </footer>
    </section>
  );
}
