-- Enable UUID extension
create extension if not exists "pgcrypto";

-- creators
create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  primary_handle text,
  platform text check (platform in ('TWITCH','KICK','YOUTUBE','X','OTHER')),
  platform_url text,
  avatar_url text,
  bio text,
  status text not null default 'UNCLAIMED' check (status in (
    'UNCLAIMED','CLAIM_REQUESTED','CREATOR_VERIFIED','OFFICIAL_PARTNER','DISPUTED'
  )),
  verified_wallet text,
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- community_tokens
create table if not exists community_tokens (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  name text not null,
  ticker text not null,
  description text not null,
  slug text unique not null,
  mint_address text unique,
  pump_url text,
  chart_url text,
  image_url text,
  metadata_uri text,
  launch_provider text not null default 'PUMPFUN',
  launch_status text not null default 'DRAFT' check (launch_status in (
    'DRAFT','LAUNCH_PENDING','LIVE_UNCLAIMED','CLAIM_REQUESTED',
    'CREATOR_VERIFIED','OFFICIAL_PARTNER','DISPUTED','ARCHIVED'
  )),
  affiliation_status text not null default 'UNOFFICIAL_COMMUNITY' check (affiliation_status in (
    'UNOFFICIAL_COMMUNITY','CREATOR_CLAIMED','OFFICIAL_PARTNER'
  )),
  creator_fee_wallet text,
  creator_fee_notes text,
  launched_by_wallet text,
  launched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- claim_requests
create table if not exists claim_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  token_id uuid references community_tokens(id) on delete set null,
  claimant_wallet text not null,
  contact_email text,
  claimant_name text,
  claimed_role text check (claimed_role in ('CREATOR','MANAGER','AGENCY','OTHER')),
  verification_method text check (verification_method in (
    'X_POST','TWITCH_PROFILE','KICK_PROFILE','YOUTUBE_PROFILE','MANUAL'
  )),
  verification_code text not null,
  verification_url text,
  status text not null default 'PENDING' check (status in (
    'PENDING','NEEDS_MORE_PROOF','APPROVED','REJECTED','CANCELLED'
  )),
  admin_notes text,
  reviewed_by_wallet text,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- token_metrics_snapshots
create table if not exists token_metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references community_tokens(id) on delete cascade,
  mint_address text not null,
  market_cap_usd numeric,
  liquidity_usd numeric,
  volume_24h_usd numeric,
  price_usd numeric,
  holders_count integer,
  creator_rewards_estimate_sol numeric,
  creator_rewards_estimate_usd numeric,
  source text not null,
  raw_json jsonb,
  created_at timestamptz default now()
);

-- admin_actions
create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  actor_wallet text not null,
  target_type text not null,
  target_id uuid not null,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz default now()
);

-- site_settings
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_community_tokens_creator_id on community_tokens(creator_id);
create index if not exists idx_community_tokens_launch_status on community_tokens(launch_status);
create index if not exists idx_claim_requests_creator_id on claim_requests(creator_id);
create index if not exists idx_claim_requests_token_id on claim_requests(token_id);
create index if not exists idx_claim_requests_status on claim_requests(status);
create index if not exists idx_token_metrics_token_id on token_metrics_snapshots(token_id);
create index if not exists idx_token_metrics_created_at on token_metrics_snapshots(created_at desc);
create index if not exists idx_admin_actions_target_id on admin_actions(target_id);

-- updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach triggers
create or replace trigger creators_updated_at
  before update on creators
  for each row execute function update_updated_at_column();

create or replace trigger community_tokens_updated_at
  before update on community_tokens
  for each row execute function update_updated_at_column();

create or replace trigger claim_requests_updated_at
  before update on claim_requests
  for each row execute function update_updated_at_column();

-- Row Level Security
alter table creators enable row level security;
alter table community_tokens enable row level security;
alter table claim_requests enable row level security;
alter table token_metrics_snapshots enable row level security;
alter table admin_actions enable row level security;
alter table site_settings enable row level security;

-- Public read policies
create policy "Public read creators"
  on creators for select using (true);

create policy "Public read community_tokens"
  on community_tokens for select using (true);

create policy "Public read token_metrics_snapshots"
  on token_metrics_snapshots for select using (true);

create policy "Public read site_settings"
  on site_settings for select using (true);

-- Service role has full access (used server-side only)
create policy "Service role full access creators"
  on creators using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Service role full access community_tokens"
  on community_tokens using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Service role full access claim_requests"
  on claim_requests using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Service role full access token_metrics_snapshots"
  on token_metrics_snapshots using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Service role full access admin_actions"
  on admin_actions using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Service role full access site_settings"
  on site_settings using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Deny direct anon inserts/updates on sensitive tables (must go through server routes)
-- claim_requests: no direct client insert; goes through /api/claims/create
-- admin_actions: server-only writes
