import type { MetricsData } from "@/lib/metrics/dexscreener";
import { StatusBadge } from "./StatusBadge";

interface MainCoinCardProps {
  pumpUrl: string;
  mintAddress: string;
  chartUrl: string;
  metrics: MetricsData | null;
}

function formatUsd(value: number | null | undefined) {
  if (value == null) return "-";

  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPrice(value: number | null | undefined) {
  if (value == null) return "-";
  if (value < 0.0001) return `$${value.toExponential(2)}`;
  if (value < 1) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(4)}`;
}

export function MainCoinCard({
  pumpUrl,
  mintAddress,
  chartUrl,
  metrics,
}: MainCoinCardProps) {
  const hasLink = Boolean(pumpUrl);
  const marketUrl = chartUrl || pumpUrl;

  return (
    <section className="main-coin-section" aria-labelledby="main-coin-title">
      <div className="main-coin-copy">
        <div className="main-coin-kicker">Main community coin</div>
        <h2 id="main-coin-title">Start with $STREAMER.</h2>
        <p>
          The main coin powers the index, creator claim flow, and the community
          layer around every streamer token on the site.
        </p>
      </div>

      <div className="token-card main-coin-card live">
        <div className="tc-head">
          <div className="main-coin-icon" aria-hidden="true">
            <img src="/streamer-nav-green-mark.png?v=2" alt="" loading="lazy" />
          </div>
          <div className="tc-id">
            <div className="tc-name">$STREAMER</div>
            <div className="tc-ticker">
              <span style={{ color: "var(--accent)" }}>$STREAMER</span>
              <span className="tc-platform-dot" />
              <span className="plat">SOLANA</span>
            </div>
          </div>
          <StatusBadge status={mintAddress ? "LIVE" : "DRAFT"} />
        </div>

        <div className="tc-metrics">
          <div className="tc-metric">
            <div className="label">Mkt Cap</div>
            <div className={metrics?.market_cap_usd ? "val" : "val unav"}>
              {formatUsd(metrics?.market_cap_usd)}
            </div>
          </div>
          <div className="tc-metric">
            <div className="label">24h Vol</div>
            <div className={metrics?.volume_24h_usd ? "val" : "val unav"}>
              {formatUsd(metrics?.volume_24h_usd)}
            </div>
          </div>
          <div className="tc-metric">
            <div className="label">Price</div>
            <div className={metrics?.price_usd ? "val" : "val unav"}>
              {formatPrice(metrics?.price_usd)}
            </div>
          </div>
        </div>

        <div className="tc-unavail main-coin-note">
          <span className="tc-unavail-dot" />
          {mintAddress
            ? "Live market data refreshes from Dexscreener."
            : "Add the $STREAMER mint to enable live market data."}
        </div>

        <div className="tc-actions">
          {hasLink ? (
            <a
              href={pumpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm btn-flex"
            >
              Buy $STREAMER
            </a>
          ) : (
            <span className="btn btn-primary btn-sm btn-flex disabled">
              Pump.fun link soon
            </span>
          )}
          {marketUrl && (
            <a
              href={marketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Chart
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
