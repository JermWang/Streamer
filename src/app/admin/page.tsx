import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDashboard } from "./AdminDashboard";
import { getServerEnv } from "@/config/env";

export const dynamic = "force-dynamic";

async function getAdminData() {
  const supabase = createAdminClient();

  const [
    { data: creators },
    { data: tokens },
    { data: pendingClaims },
    { data: recentActions },
  ] = await Promise.all([
    supabase
      .from("creators")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("community_tokens")
      .select("*, creators(name, slug)")
      .order("created_at", { ascending: false }),
    supabase
      .from("claim_requests")
      .select("*, creators(name, slug), community_tokens(name, ticker)")
      .in("status", ["PENDING", "NEEDS_MORE_PROOF"])
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return { creators, tokens, pendingClaims, recentActions };
}

export default async function AdminPage() {
  const env = getServerEnv();
  const data = await getAdminData();

  return (
    <AdminDashboard
      initialCreators={data.creators ?? []}
      initialTokens={data.tokens ?? []}
      pendingClaims={data.pendingClaims ?? []}
      recentActions={data.recentActions ?? []}
      adminWallet={env.platformAdminWallet}
    />
  );
}
