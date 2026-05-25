"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import type { Creator, CommunityToken } from "@/types/db";

interface TokenCardProps {
  creator: Creator;
  token: CommunityToken;
}

// Map creator slug → avatar gradient class
const AVATAR_CLASS: Record<string, string> = {
  kaicenat: "av-kai",
  ishowspeed: "av-speed",
  xqc: "av-xqc",
  adinross: "av-adin",
  caseoh: "av-case",
  hasanabi: "av-hasan",
  pokimane: "av-poki",
  sketch: "av-sketch",
  jynxzi: "av-jynx",
  tyceno: "av-tyc",
};

function CreatorAvatar({
  creator,
  size = 40,
  isLive = false,
}: {
  creator: Creator;
  size?: number;
  isLive?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const avClass = AVATAR_CLASS[creator.slug] ?? "av-default";
  const fallbackHandle = (creator.primary_handle ?? creator.slug)
    .replace(/^@/, "")
    .replace(/[^a-zA-Z0-9_]/g, "");
  const imgUrl =
    creator.avatar_url ?? `https://unavatar.io/twitter/${fallbackHandle}`;
  const initial = creator.name.charAt(0).toUpperCase();

  return (
    <div
      className={`avatar ${!imgFailed ? "" : avClass} ${isLive ? "live" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {!imgFailed ? (
        <img
          src={imgUrl}
          alt={creator.name}
          loading="lazy"
          onError={() => setImgFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        initial
      )}
    </div>
  );
}

export function TokenCard({ creator, token }: TokenCardProps) {
  const isLive = !!token.mint_address;
  const isVerified =
    creator.status === "CREATOR_VERIFIED" || creator.status === "OFFICIAL_PARTNER";
  const isDisputed = token.launch_status === "DISPUTED";
  const hasMetrics = false; // metrics shown on profile page; cards show tracking status

  return (
    <Link
      href={`/creator/${creator.slug}`}
      className={`token-card ${isLive ? "live" : ""} ${isVerified ? "verified" : ""} ${isDisputed ? "disputed" : ""}`}
    >
      {/* Head */}
      <div className="tc-head">
        <CreatorAvatar creator={creator} size={40} isLive={isLive} />
        <div className="tc-id">
          <div className="tc-name">
            {creator.name}
            {isVerified && (
              <span style={{ color: "var(--accent)", fontSize: 12 }}>✓</span>
            )}
          </div>
          <div className="tc-ticker">
            <span style={{ color: "var(--accent)" }}>${token.ticker}</span>
            {creator.platform && (
              <>
                <span className="tc-platform-dot" />
                <span className="plat">{creator.platform}</span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={token.launch_status} />
      </div>

      {/* Metrics row */}
      <div className="tc-metrics">
        <div className="tc-metric">
          <div className="label">Mkt Cap</div>
          <div className="val unav">—</div>
        </div>
        <div className="tc-metric">
          <div className="label">24h Vol</div>
          <div className="val unav">—</div>
        </div>
        <div className="tc-metric">
          <div className="label">24h</div>
          <div className="val unav">—</div>
        </div>
      </div>

      {/* Status message */}
      {token.mint_address && !hasMetrics && (
        <div className="tc-unavail">
          <span className="tc-unavail-dot" />
          Reward tracking unavailable · awaiting indexing
        </div>
      )}
      {!token.mint_address && token.launch_status === "DRAFT" && (
        <div className="tc-unavail">
          <span className="tc-unavail-dot" />
          Draft · awaiting manual launch
        </div>
      )}

      {/* Actions */}
      <div className="tc-actions">
        <span className="btn btn-primary btn-sm btn-flex">View Coin</span>
        {token.pump_url && (
          <span className="btn btn-secondary btn-sm">Pump ↗</span>
        )}
        {!isVerified && (
          <Link
            href={`/claim/${creator.slug}`}
            className="btn btn-ghost btn-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Claim
          </Link>
        )}
      </div>
    </Link>
  );
}
