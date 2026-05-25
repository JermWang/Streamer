import { createServerClient } from "@supabase/ssr";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { cookies } from "next/headers";
import WebSocket from "ws";
import { publicEnv } from "@/config/env";

const websocketTransport = WebSocket as unknown as WebSocketLikeConstructor;

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    realtime: { transport: websocketTransport },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          );
        } catch {
          // In Server Components cookies cannot be set
        }
      },
    },
  });
}
