/**
 * DEV-ONLY seed script. Run with:
 *   npx tsx scripts/seed.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import * as dotenv from "dotenv";
import { join } from "path";
import WebSocket from "ws";

dotenv.config({ path: join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket as unknown as WebSocketLikeConstructor },
});

const SEED_CREATORS = [
  {
    name: "Kai Cenat",
    slug: "kai-cenat",
    primary_handle: "KaiCenat",
    platform: "TWITCH",
    platform_url: "https://twitch.tv/kaicenat",
    bio: "Popular Twitch streamer and content creator.",
    token: {
      name: "Kai Cenat Community Coin",
      ticker: "KAICENAT",
      description:
        "Unofficial community token named after Kai Cenat. Not affiliated with, endorsed by, sponsored by, or controlled by Kai Cenat unless marked Verified.",
      slug: "kai-cenat-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "IShowSpeed",
    slug: "ishowspeed",
    primary_handle: "IShowSpeed",
    platform: "YOUTUBE",
    platform_url: "https://youtube.com/@ishowspeed",
    bio: "High-energy YouTube streamer and content creator.",
    token: {
      name: "IShowSpeed Community Coin",
      ticker: "SPEED",
      description:
        "Unofficial community token named after IShowSpeed. Not affiliated with, endorsed by, sponsored by, or controlled by IShowSpeed unless marked Verified.",
      slug: "ishowspeed-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "xQc",
    slug: "xqc",
    primary_handle: "xQc",
    platform: "KICK",
    platform_url: "https://kick.com/xqc",
    bio: "xQc is a variety streamer known for his high-energy streams.",
    token: {
      name: "xQc Community Coin",
      ticker: "XQC",
      description:
        "Unofficial community token named after xQc. Not affiliated with, endorsed by, sponsored by, or controlled by xQc unless marked Verified.",
      slug: "xqc-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "Adin Ross",
    slug: "adin-ross",
    primary_handle: "AdinRoss",
    platform: "KICK",
    platform_url: "https://kick.com/adinross",
    bio: "Kick streamer and content creator.",
    token: {
      name: "Adin Ross Community Coin",
      ticker: "ADIN",
      description:
        "Unofficial community token named after Adin Ross. Not affiliated with, endorsed by, sponsored by, or controlled by Adin Ross unless marked Verified.",
      slug: "adin-ross-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "CaseOh",
    slug: "caseoh",
    primary_handle: "CaseOh_",
    platform: "TWITCH",
    platform_url: "https://twitch.tv/caseoh_",
    bio: "Twitch streamer known for gaming and personality content.",
    token: {
      name: "CaseOh Community Coin",
      ticker: "CASEOH",
      description:
        "Unofficial community token named after CaseOh. Not affiliated with, endorsed by, sponsored by, or controlled by CaseOh unless marked Verified.",
      slug: "caseoh-coin",
      launch_status: "DRAFT",
    },
  },
];

async function seed() {
  console.log("Seeding creators and draft tokens...\n");

  for (const c of SEED_CREATORS) {
    const { token, ...creatorData } = c;

    // Upsert creator
    const { data: creator, error: creatorErr } = await supabase
      .from("creators")
      .upsert(creatorData, { onConflict: "slug" })
      .select()
      .single();

    if (creatorErr) {
      console.error(`Error upserting creator ${c.name}:`, creatorErr.message);
      continue;
    }

    console.log(`✓ Creator: ${creator.name} (${creator.id})`);

    // Upsert token draft
    const tokenData = {
      ...token,
      creator_id: creator.id,
      affiliation_status: "UNOFFICIAL_COMMUNITY",
      // No mint_address — this is a DRAFT. Do NOT add fake mints.
    };

    const { data: tok, error: tokErr } = await supabase
      .from("community_tokens")
      .upsert(tokenData, { onConflict: "slug" })
      .select()
      .single();

    if (tokErr) {
      console.error(`Error upserting token ${token.name}:`, tokErr.message);
      continue;
    }

    console.log(`  ✓ Token: ${tok.name} (${tok.id}) — status: ${tok.launch_status}\n`);
  }

  console.log("Seed complete.");
}

seed().catch(console.error);
