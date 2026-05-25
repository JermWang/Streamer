const KICK_OAUTH_TOKEN_URL = "https://id.kick.com/oauth/token";
const KICK_API_BASE_URL = "https://api.kick.com/public/v1";

interface KickTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

interface KickApiResponse<T> {
  data?: T;
}

interface KickChannel {
  broadcaster_user_id?: number;
  slug?: string;
  channel_slug?: string;
  livestream?: unknown | null;
  [key: string]: unknown;
}

interface KickLivestream {
  broadcaster_user_id?: number;
  slug?: string;
  channel_slug?: string;
  title?: string;
  viewer_count?: number;
  started_at?: string;
  thumbnail?: string;
  [key: string]: unknown;
}

export interface KickLiveStatus {
  provider: "kick";
  slug: string;
  isConfigured: boolean;
  isLive: boolean;
  channel: KickChannel | null;
  livestream: KickLivestream | null;
  checkedAt: string;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

function getKickEnv() {
  return {
    clientId: process.env.KICK_CLIENT_ID || undefined,
    clientSecret: process.env.KICK_CLIENT_SECRET || undefined,
  };
}

async function getKickAppAccessToken() {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.token;
  }

  const { clientId, clientSecret } = getKickEnv();
  if (!clientId || !clientSecret) {
    throw new Error("Kick API credentials are not configured");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(KICK_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Kick token request failed with ${res.status}`);
  }

  const data = (await res.json()) as KickTokenResponse;
  if (!data.access_token) {
    throw new Error("Kick token response did not include access_token");
  }

  tokenCache = {
    token: data.access_token,
    expiresAt: now + Math.max(60, data.expires_in ?? 3600) * 1000,
  };

  return tokenCache.token;
}

async function kickGet<T>(path: string, params?: URLSearchParams): Promise<T> {
  const token = await getKickAppAccessToken();
  const url = new URL(`${KICK_API_BASE_URL}${path}`);
  if (params) {
    params.forEach((value, key) => url.searchParams.append(key, value));
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Kick API request failed with ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function getKickLiveStatusBySlug(slug: string): Promise<KickLiveStatus> {
  const normalizedSlug = slug.replace(/^@/, "").trim().toLowerCase();
  const checkedAt = new Date().toISOString();
  const { clientId, clientSecret } = getKickEnv();

  if (!clientId || !clientSecret) {
    return {
      provider: "kick",
      slug: normalizedSlug,
      isConfigured: false,
      isLive: false,
      channel: null,
      livestream: null,
      checkedAt,
    };
  }

  const channelParams = new URLSearchParams();
  channelParams.append("slug", normalizedSlug);
  const channelResponse = await kickGet<KickApiResponse<KickChannel[]>>(
    "/channels",
    channelParams
  );
  const channel = channelResponse.data?.[0] ?? null;

  if (channel?.livestream) {
    return {
      provider: "kick",
      slug: normalizedSlug,
      isConfigured: true,
      isLive: true,
      channel,
      livestream: channel.livestream as KickLivestream,
      checkedAt,
    };
  }

  if (!channel?.broadcaster_user_id) {
    return {
      provider: "kick",
      slug: normalizedSlug,
      isConfigured: true,
      isLive: false,
      channel,
      livestream: null,
      checkedAt,
    };
  }

  const livestreamParams = new URLSearchParams();
  livestreamParams.append("broadcaster_user_id", String(channel.broadcaster_user_id));
  livestreamParams.append("limit", "1");
  const livestreamResponse = await kickGet<KickApiResponse<KickLivestream[]>>(
    "/livestreams",
    livestreamParams
  );
  const livestream = livestreamResponse.data?.[0] ?? null;

  return {
    provider: "kick",
    slug: normalizedSlug,
    isConfigured: true,
    isLive: Boolean(livestream),
    channel,
    livestream,
    checkedAt,
  };
}
