import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminRequest } from "@/lib/auth/admin-guard";
import { AttachMintSchema, UpdateTokenSchema } from "@/lib/validation/schemas";
import { getLaunchProvider } from "@/lib/launch";
import { generateTokenMetadata } from "@/lib/metadata/generator";
import { getSiteEnv } from "@/config/env";
import { PUMP_FUN_BASE_URL } from "@/config/constants";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/tokens/[id] — update token fields
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await req.json();
  const action = req.nextUrl.searchParams.get("action");

  const supabase = createAdminClient();

  if (action === "attach-mint") {
    const parsed = AttachMintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { data: before } = await supabase
      .from("community_tokens")
      .select()
      .eq("id", id)
      .single();

    if (!before) return NextResponse.json({ error: "Token not found" }, { status: 404 });

    const pumpUrl =
      parsed.data.pumpUrl ||
      `${PUMP_FUN_BASE_URL}/${parsed.data.mintAddress}`;

    const { data: token, error } = await supabase
      .from("community_tokens")
      .update({
        mint_address: parsed.data.mintAddress,
        pump_url: pumpUrl,
        chart_url: parsed.data.chartUrl || null,
        metadata_uri: parsed.data.metadataUri || null,
        launch_status: "LIVE_UNCLAIMED",
        launched_at: new Date().toISOString(),
        launched_by_wallet: auth.publicKey,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("admin_actions").insert({
      action_type: "TOKEN_MINT_ATTACHED",
      actor_wallet: auth.publicKey!,
      target_type: "community_tokens",
      target_id: id,
      before_json: before,
      after_json: token,
    });

    return NextResponse.json({ success: true, token });
  }

  if (action === "launch") {
    const { data: tokenRecord } = await supabase
      .from("community_tokens")
      .select("*, creators(*)")
      .eq("id", id)
      .single();

    if (!tokenRecord) return NextResponse.json({ error: "Token not found" }, { status: 404 });
    if (tokenRecord.launch_status !== "DRAFT") {
      return NextResponse.json({ error: `Token is not in DRAFT state (current: ${tokenRecord.launch_status})` }, { status: 409 });
    }

    const env = getSiteEnv();
    const provider = getLaunchProvider();

    if (provider.name === "MANUAL") {
      const checklist = provider.getManualChecklist({
        name: tokenRecord.name,
        ticker: tokenRecord.ticker,
        description: tokenRecord.description,
        imageUrl: tokenRecord.image_url || "",
        metadataUri: tokenRecord.metadata_uri || undefined,
        creatorWallet: tokenRecord.creator_fee_wallet || undefined,
      });

      // Mark as LAUNCH_PENDING
      await supabase
        .from("community_tokens")
        .update({ launch_status: "LAUNCH_PENDING" })
        .eq("id", id);

      return NextResponse.json({
        success: false,
        manualLaunch: true,
        message:
          "PumpPortal is not configured. Follow the manual launch checklist, then use attach-mint to record the result.",
        checklist,
        metadataPreview: generateTokenMetadata(
          tokenRecord.creators,
          tokenRecord,
          env.siteUrl
        ),
      });
    }

    // Auto-launch via PumpPortal
    await supabase
      .from("community_tokens")
      .update({ launch_status: "LAUNCH_PENDING" })
      .eq("id", id);

    const result = await provider.createToken({
      name: tokenRecord.name,
      ticker: tokenRecord.ticker,
      description: tokenRecord.description,
      imageUrl: tokenRecord.image_url || "",
      metadataUri: tokenRecord.metadata_uri || undefined,
      creatorWallet: tokenRecord.creator_fee_wallet || undefined,
    });

    if (!result.success || !result.mintAddress) {
      await supabase
        .from("community_tokens")
        .update({ launch_status: "DRAFT" })
        .eq("id", id);

      return NextResponse.json({
        success: false,
        error: result.error || "Launch failed. No mint address returned.",
        raw: result.raw,
      }, { status: 500 });
    }

    const { data: launched } = await supabase
      .from("community_tokens")
      .update({
        mint_address: result.mintAddress,
        pump_url: result.pumpUrl || `${PUMP_FUN_BASE_URL}/${result.mintAddress}`,
        launch_status: "LIVE_UNCLAIMED",
        launched_at: new Date().toISOString(),
        launched_by_wallet: auth.publicKey,
      })
      .eq("id", id)
      .select()
      .single();

    await supabase.from("admin_actions").insert({
      action_type: "TOKEN_LAUNCHED",
      actor_wallet: auth.publicKey!,
      target_type: "community_tokens",
      target_id: id,
      after_json: launched,
    });

    return NextResponse.json({ success: true, token: launched, result });
  }

  // Generic field update
  const parsed = UpdateTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.ticker) updateData.ticker = parsed.data.ticker;
  if (parsed.data.description) updateData.description = parsed.data.description;
  if ("imageUrl" in parsed.data) updateData.image_url = parsed.data.imageUrl || null;
  if (parsed.data.launch_status) updateData.launch_status = parsed.data.launch_status;
  if ("creator_fee_wallet" in parsed.data) updateData.creator_fee_wallet = parsed.data.creator_fee_wallet;
  if ("creator_fee_notes" in parsed.data) updateData.creator_fee_notes = parsed.data.creator_fee_notes;

  const { data: before } = await supabase.from("community_tokens").select().eq("id", id).single();
  const { data: token, error } = await supabase
    .from("community_tokens")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("admin_actions").insert({
    action_type: "TOKEN_UPDATED",
    actor_wallet: auth.publicKey!,
    target_type: "community_tokens",
    target_id: id,
    before_json: before,
    after_json: token,
  });

  return NextResponse.json({ success: true, token });
}
