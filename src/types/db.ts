export type CreatorStatus =
  | "UNCLAIMED"
  | "CLAIM_REQUESTED"
  | "CREATOR_VERIFIED"
  | "OFFICIAL_PARTNER"
  | "DISPUTED";

export type CreatorPlatform =
  | "TWITCH"
  | "KICK"
  | "YOUTUBE"
  | "X"
  | "OTHER";

export type TokenLaunchStatus =
  | "DRAFT"
  | "LAUNCH_PENDING"
  | "LIVE_UNCLAIMED"
  | "CLAIM_REQUESTED"
  | "CREATOR_VERIFIED"
  | "OFFICIAL_PARTNER"
  | "DISPUTED"
  | "ARCHIVED";

export type AffiliationStatus =
  | "UNOFFICIAL_COMMUNITY"
  | "CREATOR_CLAIMED"
  | "OFFICIAL_PARTNER";

export type ClaimStatus =
  | "PENDING"
  | "NEEDS_MORE_PROOF"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type ClaimedRole =
  | "CREATOR"
  | "MANAGER"
  | "AGENCY"
  | "OTHER";

export type VerificationMethod =
  | "X_POST"
  | "TWITCH_PROFILE"
  | "KICK_PROFILE"
  | "YOUTUBE_PROFILE"
  | "MANUAL";

export interface Creator {
  id: string;
  name: string;
  slug: string;
  primary_handle: string | null;
  platform: CreatorPlatform | null;
  platform_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: CreatorStatus;
  verified_wallet: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityToken {
  id: string;
  creator_id: string;
  name: string;
  ticker: string;
  description: string;
  slug: string;
  mint_address: string | null;
  pump_url: string | null;
  chart_url: string | null;
  image_url: string | null;
  metadata_uri: string | null;
  launch_provider: string;
  launch_status: TokenLaunchStatus;
  affiliation_status: AffiliationStatus;
  creator_fee_wallet: string | null;
  creator_fee_notes: string | null;
  launched_by_wallet: string | null;
  launched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimRequest {
  id: string;
  creator_id: string;
  token_id: string | null;
  claimant_wallet: string;
  contact_email: string | null;
  claimant_name: string | null;
  claimed_role: ClaimedRole | null;
  verification_method: VerificationMethod | null;
  verification_code: string;
  verification_url: string | null;
  status: ClaimStatus;
  admin_notes: string | null;
  reviewed_by_wallet: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenMetricsSnapshot {
  id: string;
  token_id: string;
  mint_address: string;
  market_cap_usd: number | null;
  liquidity_usd: number | null;
  volume_24h_usd: number | null;
  price_usd: number | null;
  holders_count: number | null;
  creator_rewards_estimate_sol: number | null;
  creator_rewards_estimate_usd: number | null;
  source: string;
  raw_json: unknown | null;
  created_at: string;
}

export interface AdminAction {
  id: string;
  action_type: string;
  actor_wallet: string;
  target_type: string;
  target_id: string;
  before_json: unknown | null;
  after_json: unknown | null;
  created_at: string;
}

// Joined types for pages
export interface CreatorWithToken extends Creator {
  community_tokens: CommunityToken[];
}

export interface TokenWithCreator extends CommunityToken {
  creators: Creator;
}

export interface ClaimWithRelations extends ClaimRequest {
  creators: Creator;
  community_tokens: CommunityToken | null;
}
