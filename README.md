# StreamCoin

Community streamer coins, claimable by the creators.

Unofficial community tokens named after mainstream streamers. Creators can verify and claim their page and rewards where supported by the underlying launch provider.

---

## What This App Does (and Does Not Do)

**Does:**
- Lists community-created tokens named after streamers
- Provides a creator claim/verification workflow
- Integrates with PumpPortal for token creation (if API key configured), or provides a manual launch checklist
- Tracks token metrics via Dexscreener public API
- Enforces clear "Unofficial / Unclaimed" labeling on all unverified tokens
- Admin dashboard for managing creators, tokens, and claim reviews

**Does NOT:**
- Claim affiliation with, endorsement by, or control by the named creator (unless verified)
- Control or guarantee creator fee routing — Pump.fun/PumpSwap handles that where supported
- Display fake reward numbers — if data is unavailable, it says so
- Store deployer private keys

---

## Product Language Policy

This app **never** says: official, endorsed, sponsored, partnered, "creator's token", guaranteed rewards, investment, profit.

Every unverified token page shows:

> "This is an unofficial community token named after [CREATOR_NAME]. It is not affiliated with, endorsed by, sponsored by, or controlled by [CREATOR_NAME] unless explicitly marked Verified. Creator rewards may be claimed or redirected by [CREATOR_NAME] or an authorized representative after verification, subject to the capabilities of the underlying launch/fee provider."

---

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your project URL and anon key from **Project Settings → API**.
3. Also copy the **service_role key** (keep this secret — server-only).

### 2. Run SQL Migrations

In the Supabase dashboard → **SQL Editor**, run:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, indexes, RLS policies, and triggers.

### 3. Set Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_KEY=YOUR_HELIUS_KEY
PLATFORM_ADMIN_WALLET=YourSolanaWalletPublicKeyHere
PUMPPORTAL_API_KEY=           # optional — leave blank for manual launch mode
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is accessed only server-side. It must never be exposed to the client.

### 4. Set Your Admin Wallet

`PLATFORM_ADMIN_WALLET` must be the public key of the Solana wallet you use to administer the platform. The admin dashboard requires a signed message from this wallet.

### 5. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Seeding Sample Data

```bash
npm run seed
```

Adds 5 creators (Kai Cenat, IShowSpeed, xQc, Adin Ross, CaseOh) with draft tokens. No fake mints — all tokens start in `DRAFT` status. Real mints must be attached after actual launch.

---

## Admin Dashboard (`/admin`)

Connect the admin wallet to access. Wallet must match `PLATFORM_ADMIN_WALLET`.

### Create a Creator

Admin → **+ Creator** → fill name, slug, platform, handle → submit.

### Create a Token Draft

Admin → **+ Token** → select creator → form auto-suggests name/ticker/description → review ticker warnings → submit.

### Launch a Token

**With PumpPortal API key configured:**
Admin → Tokens → click **Launch** → app calls PumpPortal endpoint → mint saved on success.

**Without PumpPortal (manual mode):**
Clicking Launch returns a checklist:
1. Go to [pump.fun](https://pump.fun) and create the token using the provided fields
2. Copy the mint address from the resulting Pump.fun URL
3. Admin → Tokens → **Attach Mint** → enter mint address + Pump.fun URL

### Attach Mint After External Launch

Admin → Tokens → **Attach Mint** → enter: mint address, Pump.fun URL, optional chart URL and metadata URI. Token status updates to `LIVE_UNCLAIMED`.

---

## Creator Claim Verification

### Public Flow

1. Creator visits `/creator/[slug]` → clicks **Claim as Creator**
2. On `/claim/[slug]`: connect Solana wallet, fill in name, email, role, verification method
3. Submit → backend generates a unique verification phrase:
   `"I am verifying my claim for [SITE_URL]/creator/[slug] with code [CODE]"`
4. Claimant posts the phrase from their official platform account
5. Admin reviews in dashboard → Approve / Needs More Proof / Reject

### Verification Methods

| Method | What the claimant does |
|--------|------------------------|
| X/Twitter | Posts verification phrase as a tweet |
| Twitch | Adds phrase to channel bio/description |
| Kick | Adds phrase to channel bio |
| YouTube | Adds to channel description or Community post |
| Manual | Admin contacts claimant via provided email |

### On Approval

- Creator status → `CREATOR_VERIFIED`, verified wallet saved
- Token status → `CREATOR_VERIFIED`, creator fee wallet updated
- Admin action logged

### Creator Fee Note

Verification confirms identity on this platform only. Actual fee routing to the creator wallet depends entirely on Pump.fun/PumpSwap's mechanics for the specific token. The app stores and displays the verified wallet — it does not control on-chain fee distribution.

---

## Token Metrics

Fetched from Dexscreener public API. Data is cached in `token_metrics_snapshots` and refreshed when stale (5 min threshold). If data is unavailable, the UI shows "Reward tracking unavailable" — never invented numbers.

Bulk refresh: `POST /api/cron/metrics` (requires admin auth header).

---

## Running Tests

```bash
npm test
```

Covers: ticker sanitization, slug generation, verification code generation, claim validation, disclaimer text, launch provider fallback, metadata generation.

---

## Security

- `SUPABASE_SERVICE_ROLE_KEY` never reaches the client
- All admin API routes verify a signed wallet message against `PLATFORM_ADMIN_WALLET`
- All claim creation requires a valid wallet signature
- Duplicate pending claims (same wallet + creator) are blocked at the DB level
- All inputs validated with Zod
- Admin actions logged to `admin_actions` with before/after JSON

---

## Status Reference

| Status | Meaning |
|--------|---------|
| `DRAFT` | Token created, not yet launched |
| `LAUNCH_PENDING` | Launch initiated, awaiting confirmation |
| `LIVE_UNCLAIMED` | Live on Pump.fun, creator has not verified |
| `CLAIM_REQUESTED` | Creator claim pending admin review |
| `CREATOR_VERIFIED` | Creator identity verified on this platform |
| `OFFICIAL_PARTNER` | Full official partnership (admin-set) |
| `DISPUTED` | Token under dispute |
| `ARCHIVED` | Removed from active display |

---

## Deployment

1. Deploy to Vercel or any Next.js host
2. Add all env vars from `.env.local.example`
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain
4. Run the SQL migration on your production Supabase project
5. Seed or create creators via admin dashboard
