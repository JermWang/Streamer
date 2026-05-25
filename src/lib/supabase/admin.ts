import { createClient } from "@supabase/supabase-js";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import WebSocket from "ws";
import { getSupabaseEnv } from "@/config/env";

const websocketTransport = WebSocket as unknown as WebSocketLikeConstructor;

// Service role client — NEVER import in client components
export function createAdminClient() {
  const env = getSupabaseEnv();
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: websocketTransport },
  });
}
