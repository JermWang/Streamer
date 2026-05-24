"use client";

import { useState } from "react";
import { useWalletAuth } from "@/components/wallet/useWalletAuth";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ClaimRequest } from "@/types/db";

interface EnrichedClaim extends ClaimRequest {
  creators?: { name: string; slug: string };
  community_tokens?: { name: string; ticker: string } | null;
}

interface Props {
  claims: EnrichedClaim[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ClaimDetailGrid({ claim }: { claim: EnrichedClaim }) {
  const rows: [string, string][] = [
    ["Claimant Wallet", claim.claimant_wallet ?? ""],
    ...(claim.claimant_name ? ([["Name", claim.claimant_name]] as [string, string][]) : []),
    ...(claim.contact_email ? ([["Email", claim.contact_email]] as [string, string][]) : []),
    ["Role", String(claim.claimed_role ?? "")],
    ["Verification Method", String(claim.verification_method ?? "")],
    ["Verification Code", claim.verification_code ?? ""],
    ...(claim.verification_url ? ([["Proof URL", claim.verification_url]] as [string, string][]) : []),
  ];

  const isMono = (label: string) =>
    label === "Claimant Wallet" || label === "Verification Code";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: "6px 12px",
        fontSize: 12.5,
      }}
    >
      {rows.map(([label, value]) => (
        <div
          key={label}
          style={{ display: "contents" }}
        >
          <dt
            style={{
              color: "var(--t3)",
              alignSelf: "start",
              paddingTop: 2,
            }}
          >
            {label}
          </dt>
          <dd
            style={{
              color: "var(--t1)",
              fontFamily: isMono(label) ? "var(--font-mono)" : "inherit",
              fontSize: isMono(label) ? 11.5 : 12.5,
              wordBreak: "break-all",
              margin: 0,
            }}
          >
            {label === "Proof URL" ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--cyan)",
                  textDecoration: "none",
                  wordBreak: "break-all",
                }}
              >
                {value} ↗
              </a>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </div>
  );
}

export function AdminClaimReview({ claims: initialClaims }: Props) {
  const { getAuthHeader } = useWalletAuth();
  const [claims, setClaims] = useState(initialClaims);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const handleAction = async (
    claimId: string,
    action: "approve" | "reject",
    needsMoreProof?: boolean
  ) => {
    setProcessing(claimId);
    setError("");

    try {
      const auth = await getAuthHeader();
      const res = await fetch(`/api/admin/claims/${claimId}?action=${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-auth": JSON.stringify(auth),
        },
        body: JSON.stringify({
          adminNotes: adminNotes[claimId] || undefined,
          needsMoreProof,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
        return;
      }

      setClaims((prev) => prev.filter((c) => c.id !== claimId));
    } catch (err) {
      setError(String(err));
    } finally {
      setProcessing(null);
    }
  };

  if (claims.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--t3)",
        }}
      >
        <div style={{ fontSize: 14, color: "var(--t2)", marginBottom: 6 }}>
          No pending claims.
        </div>
        <div style={{ fontSize: 12.5 }}>All caught up ✓</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <div
          className="disclaimer"
          style={{
            background: "rgba(255,90,95,0.08)",
            borderColor: "rgba(255,90,95,0.25)",
          }}
        >
          <div
            className="disclaimer-icon"
            style={{ background: "rgba(255,90,95,0.15)", color: "var(--red)" }}
          >
            !
          </div>
          <div className="disclaimer-text" style={{ color: "var(--red)" }}>
            {error}
          </div>
        </div>
      )}

      {claims.map((claim) => (
        <div key={claim.id} className="module">
          {/* Header */}
          <div className="module-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="module-title">
                {claim.creators?.name ?? "Unknown Creator"}
              </div>
              {claim.community_tokens && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  ${claim.community_tokens.ticker}
                </span>
              )}
              <StatusBadge status={claim.status} />
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--t4)",
              }}
            >
              {timeAgo(claim.created_at)}
            </span>
          </div>

          <div className="module-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Details grid */}
            <ClaimDetailGrid claim={claim} />

            {/* Expected phrase box */}
            <div
              className="code-box"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "var(--t4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                Expected phrase on their public account
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--t2)",
                  margin: 0,
                  lineHeight: 1.5,
                  wordBreak: "break-all",
                }}
              >
                I am verifying my claim for [site]/creator/
                {claim.creators?.slug} with code {claim.verification_code}
              </p>
            </div>

            {/* Admin notes */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "var(--t3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 6,
                }}
              >
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes[claim.id] ?? ""}
                onChange={(e) =>
                  setAdminNotes((prev) => ({
                    ...prev,
                    [claim.id]: e.target.value,
                  }))
                }
                className="sc-textarea"
                rows={2}
                maxLength={1000}
                placeholder="Internal notes..."
                style={{ fontSize: 12.5 }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                onClick={() => handleAction(claim.id, "approve")}
                disabled={processing === claim.id}
                className="btn btn-primary btn-sm"
                style={{ minWidth: 90 }}
              >
                {processing === claim.id ? "Processing…" : "✓ Approve"}
              </button>
              <button
                onClick={() => handleAction(claim.id, "reject", true)}
                disabled={processing === claim.id}
                className="btn btn-secondary btn-sm"
                style={{
                  color: "var(--amber)",
                  borderColor: "rgba(245,165,36,0.35)",
                }}
              >
                Needs More Proof
              </button>
              <button
                onClick={() => handleAction(claim.id, "reject")}
                disabled={processing === claim.id}
                className="btn btn-destructive btn-sm"
              >
                Reject
              </button>
              {claim.creators?.slug && (
                <a
                  href={`/creator/${claim.creators.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  View Creator →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
