import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminRequest } from "@/lib/auth/admin-guard";
import { ApproveClaimSchema, RejectClaimSchema } from "@/lib/validation/schemas";

// POST /api/admin/claims/[id]?action=approve|reject
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const action = req.nextUrl.searchParams.get("action");
  if (!action || !["approve", "reject", "needs_more_proof"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get claim with creator and token
  const { data: claim, error: claimErr } = await supabase
    .from("claim_requests")
    .select("*, creators(*), community_tokens(*)")
    .eq("id", id)
    .single();

  if (claimErr || !claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  if (!["PENDING", "NEEDS_MORE_PROOF"].includes(claim.status)) {
    return NextResponse.json(
      { error: `Claim is already ${claim.status}` },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));

  if (action === "approve") {
    const parsed = ApproveClaimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const before = { ...claim };

    // Update claim
    await supabase
      .from("claim_requests")
      .update({
        status: "APPROVED",
        admin_notes: parsed.data.adminNotes || null,
        reviewed_by_wallet: auth.publicKey,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Update creator to CREATOR_VERIFIED
    await supabase
      .from("creators")
      .update({
        status: "CREATOR_VERIFIED",
        verified_wallet: claim.claimant_wallet,
        verified_at: new Date().toISOString(),
      })
      .eq("id", claim.creator_id);

    // Update token status if exists
    if (claim.token_id) {
      await supabase
        .from("community_tokens")
        .update({
          launch_status: "CREATOR_VERIFIED",
          affiliation_status: "CREATOR_CLAIMED",
          creator_fee_wallet: claim.claimant_wallet,
        })
        .eq("id", claim.token_id)
        .neq("launch_status", "ARCHIVED");
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      action_type: "CLAIM_APPROVED",
      actor_wallet: auth.publicKey!,
      target_type: "claim_requests",
      target_id: id,
      before_json: before,
      after_json: { status: "APPROVED" },
    });

    return NextResponse.json({ success: true, action: "approved" });
  }

  if (action === "reject") {
    const parsed = RejectClaimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const newStatus = parsed.data.needsMoreProof ? "NEEDS_MORE_PROOF" : "REJECTED";
    const before = { ...claim };

    await supabase
      .from("claim_requests")
      .update({
        status: newStatus,
        admin_notes: parsed.data.adminNotes || null,
        reviewed_by_wallet: auth.publicKey,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    // If rejecting and no other pending claims, revert creator status to UNCLAIMED
    if (newStatus === "REJECTED") {
      const { data: pendingClaims } = await supabase
        .from("claim_requests")
        .select("id")
        .eq("creator_id", claim.creator_id)
        .in("status", ["PENDING", "NEEDS_MORE_PROOF"]);

      if (!pendingClaims || pendingClaims.length === 0) {
        await supabase
          .from("creators")
          .update({ status: "UNCLAIMED" })
          .eq("id", claim.creator_id)
          .eq("status", "CLAIM_REQUESTED");
      }
    }

    await supabase.from("admin_actions").insert({
      action_type: `CLAIM_${newStatus}`,
      actor_wallet: auth.publicKey!,
      target_type: "claim_requests",
      target_id: id,
      before_json: before,
      after_json: { status: newStatus },
    });

    return NextResponse.json({ success: true, action: newStatus.toLowerCase() });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
