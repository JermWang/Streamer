import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/config/env";

// Service role client — NEVER import in client components
export function createAdminClient() {
  const env = getServerEnv();
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
