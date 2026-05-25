function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optionalEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}

export function getSupabaseEnv() {
  return {
    supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getSiteEnv() {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  };
}

// Server-only env vars for admin-only operations.
export function getServerEnv() {
  return {
    ...getSupabaseEnv(),
    solanaRpcUrl: requireEnv("NEXT_PUBLIC_SOLANA_RPC_URL"),
    heliusApiKey: optionalEnv("HELIUS_API_KEY"),
    platformAdminWallet: requireEnv("PLATFORM_ADMIN_WALLET"),
    pumpportalApiKey: optionalEnv("PUMPPORTAL_API_KEY"),
    ...getSiteEnv(),
  };
}

// Public env vars (safe for client)
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  solanaRpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};
