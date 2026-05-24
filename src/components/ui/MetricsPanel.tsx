import type { TokenMetricsSnapshot } from "@/types/db";

interface MetricsPanelProps {
  metrics: TokenMetricsSnapshot | null;
  mintAddress: string | null;
  pumpUrl: string | null;
  chartUrl: string | null;
}

function formatUsd(val: number | null | undefined): string {
  if (val == null) return "—";
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

function formatPrice(val: number | null | undefined): string {
  if (val == null) return "—";
  if (val < 0.000001) return `$${val.toExponential(3)}`;
  return `$${val.toFixed(6)}`;
}

export function MetricsPanel({ metrics, mintAddress, pumpUrl, chartUrl }: MetricsPanelProps) {
  if (!mintAddress) {
    return (
      <div className="chart-card">
        <div
          style={{
            height: 180,
            display: "grid",
            placeItems: "center",
            flexDirection: "column",
            gap: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--t3)" }}>
            Token not yet launched
          </div>
          <div style={{ fontSize: 11.5, color: "var(--t4)" }}>
            No market data available.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--t3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            Market Data
          </div>
          <div>
            <span className="chart-price">
              {metrics ? formatPrice(metrics.price_usd) : "—"}
            </span>
          </div>
        </div>
        {metrics && (
          <div
            style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--font-mono)" }}
          >
            via {metrics.source}
          </div>
        )}
      </div>

      {metrics ? (
        <>
          <div className="chart-meta">
            {[
              { label: "Market Cap", value: formatUsd(metrics.market_cap_usd) },
              { label: "24h Volume", value: formatUsd(metrics.volume_24h_usd) },
              { label: "Liquidity", value: formatUsd(metrics.liquidity_usd) },
              { label: "Price", value: formatPrice(metrics.price_usd) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="label">{label}</div>
                <div className="val">{value}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            height: 120,
            display: "grid",
            placeItems: "center",
            background: "var(--bg-2)",
            borderRadius: 8,
            color: "var(--t3)",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ marginBottom: 4 }}>Reward tracking unavailable</div>
            <div style={{ fontSize: 11.5, color: "var(--t4)" }}>
              Market data could not be fetched. Check back later.
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid var(--border-faint)",
          fontSize: 11.5,
          color: "var(--t3)",
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: "0 0 10px" }}>
          Creator rewards are handled by Pump.fun/PumpSwap mechanics where available.
          This app does not control or route trading fees.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {pumpUrl && (
            <a
              href={pumpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Pump.fun ↗
            </a>
          )}
          {chartUrl && (
            <a
              href={chartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Chart ↗
            </a>
          )}
          {mintAddress && !chartUrl && (
            <a
              href={`https://dexscreener.com/solana/${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              DexScreener ↗
            </a>
          )}
          {mintAddress && (
            <a
              href={`https://solscan.io/token/${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              Solscan ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
