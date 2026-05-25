"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

interface StreamEmbedProps {
  platform: string | null;
  platformUrl: string | null;
  handle: string | null;
  creatorName: string;
}

interface KickLiveData {
  isLive: boolean;
  isConfigured: boolean;
  livestream: {
    viewer_count?: number;
    title?: string;
  } | null;
}

function cleanHandle(handle: string | null | undefined) {
  return handle?.replace(/^@/, "").trim() || "";
}

function channelFromUrl(platformUrl: string | null, fallbackHandle: string | null) {
  if (!platformUrl) return cleanHandle(fallbackHandle);
  try {
    const url = new URL(platformUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    return cleanHandle(parts[0] ?? fallbackHandle);
  } catch {
    return cleanHandle(fallbackHandle);
  }
}

const YOUTUBE_CHANNEL_IDS: Record<string, string> = {
  ishowspeed: "UCWsDFcIhY2DBi3GB5uykGXA",
};

function youtubeChannelIdFromUrl(platformUrl: string | null, fallbackHandle: string | null) {
  const fallback = cleanHandle(fallbackHandle).toLowerCase();

  if (platformUrl) {
    try {
      const url = new URL(platformUrl);
      const parts = url.pathname.split("/").filter(Boolean);
      const channelIndex = parts.findIndex((part) => part.toLowerCase() === "channel");
      if (channelIndex >= 0 && parts[channelIndex + 1]) {
        return parts[channelIndex + 1];
      }
      const handlePart = parts.find((part) => part.startsWith("@"));
      if (handlePart) {
        const key = handlePart.replace(/^@/, "").toLowerCase();
        if (YOUTUBE_CHANNEL_IDS[key]) return YOUTUBE_CHANNEL_IDS[key];
      }
    } catch {
      // fall through
    }
  }

  return YOUTUBE_CHANNEL_IDS[fallback] ?? null;
}

function formatViewers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function StreamEmbed({
  platform,
  platformUrl,
  handle,
  creatorName,
}: StreamEmbedProps) {
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.hostname,
    () => ""
  );

  const normalizedPlatform = platform?.toUpperCase() ?? null;
  const channel = useMemo(
    () => channelFromUrl(platformUrl, handle),
    [platformUrl, handle]
  );
  const youtubeChannelId = useMemo(
    () => youtubeChannelIdFromUrl(platformUrl, handle),
    [platformUrl, handle]
  );

  // ── Kick live status ──────────────────────────────────────────────
  const [kickLive, setKickLive] = useState<KickLiveData | null>(null);
  const [liveChecked, setLiveChecked] = useState(false);

  useEffect(() => {
    if (normalizedPlatform !== "KICK" || !channel) return;

    let active = true;

    async function check() {
      try {
        const res = await fetch(`/api/live/kick/${encodeURIComponent(channel)}`);
        if (!res.ok || !active) return;
        const data = (await res.json()) as KickLiveData;
        if (active) {
          setKickLive(data);
          setLiveChecked(true);
        }
      } catch {
        if (active) setLiveChecked(true);
      }
    }

    check();
    const id = window.setInterval(check, 60_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [normalizedPlatform, channel]);

  const isKick = normalizedPlatform === "KICK";
  const isLive = isKick ? (kickLive?.isLive ?? false) : false;
  const viewerCount = kickLive?.livestream?.viewer_count ?? null;
  const streamTitle = kickLive?.livestream?.title ?? null;

  // ── Embed URL ─────────────────────────────────────────────────────
  const embedUrl = useMemo(() => {
    if (normalizedPlatform === "TWITCH") {
      if (!channel || !host) return null;
      return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(host)}&muted=true&autoplay=false`;
    }
    if (normalizedPlatform === "KICK") {
      if (!channel) return null;
      return `https://player.kick.com/${encodeURIComponent(channel)}?autoplay=false&muted=true`;
    }
    if (normalizedPlatform === "YOUTUBE") {
      if (!youtubeChannelId) return null;
      return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(youtubeChannelId)}&autoplay=0&mute=1`;
    }
    return null;
  }, [channel, host, normalizedPlatform, youtubeChannelId]);

  const platformLabel =
    normalizedPlatform === "TWITCH" ? "Twitch"
    : normalizedPlatform === "KICK" ? "Kick"
    : normalizedPlatform === "YOUTUBE" ? "YouTube"
    : platform ?? "stream";

  // ── Live status eyebrow ───────────────────────────────────────────
  function LiveEyebrow() {
    if (isKick && !liveChecked) {
      return (
        <div className="stream-eyebrow">
          <span
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--t4)", flexShrink: 0,
            }}
          />
          CHECKING STATUS…
        </div>
      );
    }

    if (isKick && isLive) {
      return (
        <div className="stream-eyebrow">
          <span className="rec-dot" />
          LIVE NOW
          {viewerCount != null && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                fontSize: 10,
                background: "var(--accent-soft)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              {formatViewers(viewerCount)} watching
            </span>
          )}
        </div>
      );
    }

    if (isKick && !isLive) {
      return (
        <div className="stream-eyebrow">
          <span
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--t4)", flexShrink: 0,
            }}
          />
          OFFLINE · embed ready when live
        </div>
      );
    }

    // Twitch / YouTube — can't check server-side easily, show generic
    return (
      <div className="stream-eyebrow">
        <span className="rec-dot" />
        RAID TARGET
      </div>
    );
  }

  return (
    <div className={`stream-panel${isLive ? " stream-panel-live" : ""}`}>
      <div className="stream-panel-head">
        <div>
          <LiveEyebrow />
          <h2>{creatorName} live channel</h2>
          {streamTitle && (
            <div
              style={{
                fontSize: 12,
                color: "var(--t3)",
                marginTop: 4,
                fontStyle: "italic",
                maxWidth: 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {streamTitle}
            </div>
          )}
        </div>
        {platformUrl && (
          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-sm ${isLive ? "btn-primary" : "btn-secondary"}`}
          >
            {isLive ? `Watch on ${platformLabel} ↗` : `Open ${platformLabel}`}
          </a>
        )}
      </div>

      <div className="stream-frame">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${creatorName} ${platformLabel} stream`}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="stream-empty">
            <div className="stream-empty-title">No embeddable stream configured</div>
            <div>
              Add a Twitch, Kick, or YouTube channel URL in the creator admin
              record to show the live player here.
            </div>
          </div>
        )}
      </div>

      <div className="stream-raid-copy">
        <strong>Raid script:</strong> Go say the community already built the coin.
        Ask {creatorName} to claim the Pump.fun fees and take control of the page.
        <span className="stream-note">
          {isKick
            ? isLive
              ? `${creatorName} is live right now — perfect time to raid.`
              : "Creator is currently offline. The embed will activate when they go live."
            : "If the creator is offline, the embedded platform player may show its own offline state."}
        </span>
      </div>
    </div>
  );
}
