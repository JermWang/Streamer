import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminRequest } from "@/lib/auth/admin-guard";
import { CreateTokenSchema } from "@/lib/validation/schemas";
import { sanitizeTicker, tickerWarnings } from "@/lib/metadata/generator";

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  // Verify creator exists
  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("id", input.creatorId)
    .single();

  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const warnings = tickerWarnings(input.ticker);
  const sanitizedTicker = sanitizeTicker(input.ticker);

  const { data: token, error } = await supabase
    .from("community_tokens")
    .insert({
      creator_id: input.creatorId,
      name: input.name,
      ticker: sanitizedTicker,
      description: input.description,
      slug: input.slug,
      image_url: input.imageUrl || null,
      launch_status: "DRAFT",
      affiliation_status: "UNOFFICIAL_COMMUNITY",
      creator_fee_wallet: input.creatorFeeWallet || null,
      creator_fee_notes: input.creatorFeeNotes || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Token slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("admin_actions").insert({
    action_type: "TOKEN_CREATED",
    actor_wallet: auth.publicKey!,
    target_type: "community_tokens",
    target_id: token.id,
    after_json: token,
  });

  return NextResponse.json({ success: true, token, warnings });
}
