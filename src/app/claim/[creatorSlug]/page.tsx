export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClaimForm } from "./ClaimForm";

interface PageProps {
  params: Promise<{ creatorSlug: string }>;
}

export default async function ClaimPage({ params }: PageProps) {
  const { creatorSlug } = await params;
  const supabase = createAdminClient();

  const { data: creator } = await supabase
    .from("creators")
    .select("*, community_tokens(*)")
    .eq("slug", creatorSlug)
    .single();

  if (!creator) notFound();

  if (
    creator.status === "CREATOR_VERIFIED" ||
    creator.status === "OFFICIAL_PARTNER"
  ) {
    return (
      <div className="page">
        <div
          style={{
            maxWidth: 480,
            margin: "48px auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "var(--accent-soft)",
              border: "1px solid rgba(43,244,154,0.3)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 20px",
              color: "var(--accent)",
              fontSize: 24,
            }}
          >
            ✓
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 8px",
              color: "var(--t1)",
            }}
          >
            Already Verified
          </h1>
          <p style={{ color: "var(--t2)", fontSize: 14, margin: "0 0 20px" }}>
            {creator.name} has already been verified on this platform.
          </p>
          <Link href={`/creator/${creator.slug}`} className="btn btn-primary">
            View creator page →
          </Link>
        </div>
      </div>
    );
  }

  const token = creator.community_tokens?.[0] ?? null;

  return (
    <div className="page">
      <ClaimForm creator={creator} token={token} />
    </div>
  );
}
