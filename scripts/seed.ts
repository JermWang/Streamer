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

type SeedCreator = {
  name: string;
  slug: string;
  primary_handle: string;
  platform: string;
  platform_url: string;
  avatar_url: string | null;
  bio: string;
  token: {
    name: string;
    ticker: string;
    description: string;
    slug: string;
    launch_status: string;
  };
};

const SEED_CREATORS: SeedCreator[] = [
  {
    name: "Kai Cenat",
    slug: "kai-cenat",
    primary_handle: "KaiCenat",
    platform: "TWITCH",
    platform_url: "https://twitch.tv/kaicenat",
    avatar_url: "https://unavatar.io/twitter/KaiCenat",
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
    avatar_url: "https://yt3.googleusercontent.com/ieK0j0sDqI_AHDwYxZ2Wly07-R7PG4S3YMtxOWCEe1QH-I0FgimJ92tlydQa6M78YD0VaywCaw=s900-c-k-c0x00ffffff-no-rj",
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
    avatar_url: "https://unavatar.io/twitter/xQc",
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
    avatar_url: "https://unavatar.io/twitter/AdinRoss",
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
    name: "Clavicular",
    slug: "clavicular",
    primary_handle: "clavicular",
    platform: "KICK",
    platform_url: "https://kick.com/clavicular",
    avatar_url: null,
    bio: "Kick streamer and content creator.",
    token: {
      name: "Clavicular Community Coin",
      ticker: "CLAV",
      description:
        "Unofficial community token named after Clavicular. Not affiliated with, endorsed by, sponsored by, or controlled by Clavicular unless marked Verified.",
      slug: "clavicular-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "Trainwreckstv",
    slug: "trainwreckstv",
    primary_handle: "trainwreckstv",
    platform: "KICK",
    platform_url: "https://kick.com/trainwreckstv",
    avatar_url: null,
    bio: "Kick streamer and host of the Scuffed Podcast.",
    token: {
      name: "Trainwreckstv Community Coin",
      ticker: "TRAIN",
      description:
        "Unofficial community token named after Trainwreckstv. Not affiliated with, endorsed by, sponsored by, or controlled by Trainwreckstv unless marked Verified.",
      slug: "trainwreckstv-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "N3on",
    slug: "n3on",
    primary_handle: "n3on",
    platform: "KICK",
    platform_url: "https://kick.com/n3on",
    avatar_url: null,
    bio: "Kick streamer and content creator.",
    token: {
      name: "N3on Community Coin",
      ticker: "N3ON",
      description:
        "Unofficial community token named after N3on. Not affiliated with, endorsed by, sponsored by, or controlled by N3on unless marked Verified.",
      slug: "n3on-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "Westcol",
    slug: "westcol",
    primary_handle: "westcol",
    platform: "KICK",
    platform_url: "https://kick.com/westcol",
    avatar_url: null,
    bio: "Kick streamer and content creator.",
    token: {
      name: "Westcol Community Coin",
      ticker: "WEST",
      description:
        "Unofficial community token named after Westcol. Not affiliated with, endorsed by, sponsored by, or controlled by Westcol unless marked Verified.",
      slug: "westcol-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "Ac7ionMan",
    slug: "ac7ionman",
    primary_handle: "ac7ionman",
    platform: "KICK",
    platform_url: "https://kick.com/ac7ionman",
    avatar_url: null,
    bio: "Kick streamer and content creator.",
    token: {
      name: "Ac7ionMan Community Coin",
      ticker: "AC7ION",
      description:
        "Unofficial community token named after Ac7ionMan. Not affiliated with, endorsed by, sponsored by, or controlled by Ac7ionMan unless marked Verified.",
      slug: "ac7ionman-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "Fousey",
    slug: "fousey",
    primary_handle: "fousey",
    platform: "KICK",
    platform_url: "https://kick.com/fousey",
    avatar_url: null,
    bio: "Kick streamer and content creator.",
    token: {
      name: "Fousey Community Coin",
      ticker: "FOUSEY",
      description:
        "Unofficial community token named after Fousey. Not affiliated with, endorsed by, sponsored by, or controlled by Fousey unless marked Verified.",
      slug: "fousey-coin",
      launch_status: "DRAFT",
    },
  },
  {
    name: "CaseOh",
    slug: "caseoh",
    primary_handle: "CaseOh_",
    platform: "TWITCH",
    platform_url: "https://twitch.tv/caseoh_",
    avatar_url: "https://unavatar.io/twitter/Caseoh__",
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
