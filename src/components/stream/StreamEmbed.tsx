"use client";

import { useMemo, useSyncExternalStore } from "react";

interface StreamEmbedProps {
  platform: string | null;
  platformUrl: string | null;
  handle: string | null;
  creatorName: string;
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
      // Fall back to the primary handle mapping below.
    }
  }

  return YOUTUBE_CHANNEL_IDS[fallback] ?? null;
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

  const embedUrl = useMemo(() => {
    if (normalizedPlatform === "TWITCH") {
      if (!channel) return null;
      if (!host) return null;
      return `https://player.twitch.tv/?channel=${encodeURIComponent(
        channel
      )}&parent=${encodeURIComponent(host)}&muted=true&autoplay=false`;
    }

    if (normalizedPlatform === "KICK") {
      if (!channel) return null;
      return `https://player.kick.com/${encodeURIComponent(channel)}?autoplay=false&muted=true`;
    }

    if (normalizedPlatform === "YOUTUBE") {
      if (!youtubeChannelId) return null;
      return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(
        youtubeChannelId
      )}&autoplay=0&mute=1`;
    }

    return null;
  }, [channel, host, normalizedPlatform, youtubeChannelId]);

  const label =
    normalizedPlatform === "TWITCH"
      ? "Twitch"
      : normalizedPlatform === "KICK"
        ? "Kick"
        : normalizedPlatform === "YOUTUBE"
          ? "YouTube"
          : platform ?? "stream";

  return (
    <div className="stream-panel">
      <div className="stream-panel-head">
        <div>
          <div className="stream-eyebrow">
            <span className="rec-dot" />
            RAID TARGET
          </div>
          <h2>{creatorName} live channel</h2>
        </div>
        {platformUrl && (
          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            Open {label}
          </a>
        )}
      </div>

      <div className="stream-frame">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${creatorName} ${label} stream`}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="stream-empty">
            <div className="stream-empty-title">No embeddable stream configured</div>
            <div>
              Add a Twitch, Kick, or YouTube channel URL in the creator admin record
              to show the live player here.
            </div>
          </div>
        )}
      </div>

      <div className="stream-raid-copy">
        <strong>Raid script:</strong> Go say the community already built the coin.
        Ask {creatorName} to claim the Pump.fun fees and take control of the page.
        <span className="stream-note">
          If the creator is offline, the embedded platform player may show its own
          offline or unavailable state.
        </span>
      </div>
    </div>
  );
}
