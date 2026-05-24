import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWalletSignature } from "@/lib/auth/wallet";
import { CreateClaimSchema } from "@/lib/validation/schemas";
import { generateVerificationCode, buildVerificationPhrase } from "@/lib/metadata/generator";
import { getServerEnv } from "@/config/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateClaimSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const env = getServerEnv();
    const supabase = createAdminClient();

    // Verify wallet signature
    const sigResult = verifyWalletSignature(
      input.message,
      input.signature,
      input.claimantWallet
    );
    if (!sigResult.valid) {
      return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
    }

    // Resolve creator
    const { data: creator, error: creatorErr } = await supabase
      .from("creators")
      .select("id, name, slug, status")
      .eq("slug", input.creatorSlug)
      .single();

    if (creatorErr || !creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Check for existing pending claim from this wallet for this creator
    const { data: existing } = await supabase
      .from("claim_requests")
      .select("id, status")
      .eq("creator_id", creator.id)
      .eq("claimant_wallet", input.claimantWallet)
      .in("status", ["PENDING", "NEEDS_MORE_PROOF"])
      .single();

    if (existing) {
      return NextResponse.json(
        {
          error: "You already have a pending claim for this creator.",
          existingClaimId: existing.id,
        },
        { status: 409 }
      );
    }

    // Get creator's token if any
    const { data: token } = await supabase
      .from("community_tokens")
      .select("id")
      .eq("creator_id", creator.id)
      .neq("launch_status", "ARCHIVED")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationPhrase = buildVerificationPhrase(
      env.siteUrl,
      creator.slug,
      verificationCode
    );

    // Insert claim request
    const { data: claim, error: claimErr } = await supabase
      .from("claim_requests")
      .insert({
        creator_id: creator.id,
        token_id: token?.id ?? null,
        claimant_wallet: input.claimantWallet,
        contact_email: input.contactEmail || null,
        claimant_name: input.claimantName || null,
        claimed_role: input.claimedRole,
        verification_method: input.verificationMethod,
        verification_code: verificationCode,
        verification_url: input.verificationUrl || null,
        status: "PENDING",
      })
      .select()
      .single();

    if (claimErr || !claim) {
      console.error("Claim insert error:", claimErr);
      return NextResponse.json({ error: "Failed to create claim request" }, { status: 500 });
    }

    // Update creator status to CLAIM_REQUESTED if currently UNCLAIMED
    if (creator.status === "UNCLAIMED") {
      await supabase
        .from("creators")
        .update({ status: "CLAIM_REQUESTED" })
        .eq("id", creator.id);
    }

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      verificationCode,
      verificationPhrase,
      instructions: getVerificationInstructions(input.verificationMethod, verificationPhrase),
      nextSteps:
        "Post the verification phrase from your official account, then wait for admin review. You will be contacted at the email provided.",
    });
  } catch (e) {
    console.error("Claim creation error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getVerificationInstructions(method: string, phrase: string): string[] {
  switch (method) {
    case "X_POST":
      return [
        `Post exactly this text as a tweet from your official X/Twitter account:`,
        `"${phrase}"`,
        `Then submit the URL of that tweet as your verification URL.`,
      ];
    case "TWITCH_PROFILE":
      return [
        `Add exactly this text to your Twitch channel description or bio:`,
        `"${phrase}"`,
        `Then submit your Twitch channel URL as verification.`,
      ];
    case "KICK_PROFILE":
      return [
        `Add exactly this text to your Kick channel bio:`,
        `"${phrase}"`,
        `Then submit your Kick channel URL as verification.`,
      ];
    case "YOUTUBE_PROFILE":
      return [
        `Add exactly this text to your YouTube channel description or post a Community post:`,
        `"${phrase}"`,
        `Then submit your YouTube channel URL as verification.`,
      ];
    case "MANUAL":
      return [
        `An admin will contact you at your provided email to arrange manual verification.`,
        `Please include your verification code: ${phrase}`,
      ];
    default:
      return [`Verification phrase: "${phrase}"`];
  }
}
