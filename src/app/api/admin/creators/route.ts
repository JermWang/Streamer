import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminRequest } from "@/lib/auth/admin-guard";
import { CreateCreatorSchema, UpdateCreatorSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateCreatorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const insertData: Record<string, unknown> = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    primary_handle: parsed.data.primary_handle || null,
    platform: parsed.data.platform || null,
    platform_url: parsed.data.platform_url || null,
    avatar_url: parsed.data.avatar_url || null,
    bio: parsed.data.bio || null,
    status: "UNCLAIMED",
  };

  const { data: creator, error } = await supabase
    .from("creators")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("admin_actions").insert({
    action_type: "CREATOR_CREATED",
    actor_wallet: auth.publicKey!,
    target_type: "creators",
    target_id: creator.id,
    after_json: creator,
  });

  return NextResponse.json({ success: true, creator });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const url = req.nextUrl;
  const creatorId = url.searchParams.get("id");
  if (!creatorId) {
    return NextResponse.json({ error: "Missing creator id" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = UpdateCreatorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from("creators")
    .select()
    .eq("id", creatorId)
    .single();

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.slug) updateData.slug = parsed.data.slug;
  if ("primary_handle" in parsed.data) updateData.primary_handle = parsed.data.primary_handle;
  if ("platform" in parsed.data) updateData.platform = parsed.data.platform;
  if ("platform_url" in parsed.data) updateData.platform_url = parsed.data.platform_url || null;
  if ("avatar_url" in parsed.data) updateData.avatar_url = parsed.data.avatar_url || null;
  if ("bio" in parsed.data) updateData.bio = parsed.data.bio;
  if ("status" in parsed.data) updateData.status = parsed.data.status;
  if ("verified_wallet" in parsed.data) updateData.verified_wallet = parsed.data.verified_wallet;

  const { data: creator, error } = await supabase
    .from("creators")
    .update(updateData)
    .eq("id", creatorId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("admin_actions").insert({
    action_type: "CREATOR_UPDATED",
    actor_wallet: auth.publicKey!,
    target_type: "creators",
    target_id: creatorId,
    before_json: before,
    after_json: creator,
  });

  return NextResponse.json({ success: true, creator });
}
