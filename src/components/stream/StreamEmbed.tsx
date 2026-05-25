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

  const embedUrl = useMemo(() => {
    if (!channel) return null;

    if (normalizedPlatform === "TWITCH") {
      if (!host) return null;
      return `https://player.twitch.tv/?channel=${encodeURIComponent(
        channel
      )}&parent=${encodeURIComponent(host)}&muted=true&autoplay=false`;
    }

    if (normalizedPlatform === "KICK") {
      return `https://player.kick.com/${encodeURIComponent(channel)}?autoplay=false&muted=true`;
    }

    return null;
  }, [channel, host, normalizedPlatform]);

  const label =
    normalizedPlatform === "TWITCH"
      ? "Twitch"
      : normalizedPlatform === "KICK"
        ? "Kick"
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
              Add a Twitch or Kick channel URL in the creator admin record to show
              the live player here.
            </div>
          </div>
        )}
      </div>

      <div className="stream-raid-copy">
        <strong>Raid script:</strong> Go say the community already built the coin.
        Ask {creatorName} to claim the Pump.fun fees and take control of the page.
      </div>
    </div>
  );
}
