"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { SafeWalletMultiButton } from "@/components/wallet/WalletButton";
import bs58 from "bs58";
import { buildSignInMessage, generateNonce } from "@/lib/auth/wallet";
import type { Creator, CommunityToken } from "@/types/db";

interface ClaimFormProps {
  creator: Creator;
  token: CommunityToken | null;
}

type VerificationMethod =
  | "X_POST"
  | "TWITCH_PROFILE"
  | "KICK_PROFILE"
  | "YOUTUBE_PROFILE"
  | "MANUAL";

type ClaimedRole = "CREATOR" | "MANAGER" | "AGENCY" | "OTHER";

interface ClaimResult {
  verificationCode: string;
  verificationPhrase: string;
  instructions: string[];
  nextSteps: string;
  claimId: string;
}

const STEPS = [
  { num: 1, label: "Step 1", name: "Connect wallet" },
  { num: 2, label: "Step 2", name: "Your details" },
  { num: 3, label: "Step 3", name: "Post phrase" },
  { num: 4, label: "Step 4", name: "Submit proof" },
];

const METHOD_OPTIONS: { k: VerificationMethod; label: string; placeholder: string }[] = [
  { k: "X_POST",           label: "X / Twitter post",        placeholder: "https://x.com/your-handle/status/..." },
  { k: "TWITCH_PROFILE",   label: "Twitch bio",               placeholder: "https://twitch.tv/your-handle/about" },
  { k: "KICK_PROFILE",     label: "Kick bio",                 placeholder: "https://kick.com/your-handle" },
  { k: "YOUTUBE_PROFILE",  label: "YouTube description",     placeholder: "https://youtube.com/@your-handle/about" },
  { k: "MANUAL",           label: "Manual / Email",           placeholder: "Provide best contact for manual verification" },
];

const ROLE_OPTIONS: { k: ClaimedRole; label: string }[] = [
  { k: "CREATOR",  label: "I am the creator" },
  { k: "MANAGER",  label: "Manager / Rep" },
  { k: "AGENCY",   label: "Agency" },
  { k: "OTHER",    label: "Other" },
];

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ClaimForm({ creator, token }: ClaimFormProps) {
  const { connected, publicKey, signMessage } = useWallet();

  const [step, setStep] = useState(1);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    claimantName: "",
    contactEmail: "",
    claimedRole: "CREATOR" as ClaimedRole,
    verificationMethod: "X_POST" as VerificationMethod,
    verificationUrl: "",
    additionalContext: "",
  });

  const methodConfig = METHOD_OPTIONS.find((m) => m.k === form.verificationMethod)!;

  async function handleSubmit() {
    if (!connected || !publicKey || !signMessage) return;
    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const nonce = generateNonce();
      const timestamp = Date.now();
      const message = buildSignInMessage(nonce, timestamp);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      const res = await fetch("/api/claims/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorSlug: creator.slug,
          claimantWallet: publicKey.toBase58(),
          contactEmail: form.contactEmail,
          claimantName: form.claimantName,
          claimedRole: form.claimedRole,
          verificationMethod: form.verificationMethod,
          verificationUrl: form.verificationUrl || undefined,
          signature,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to submit claim.");
        setSubmitState("error");
        return;
      }

      setClaimResult(data);
      setSubmitState("done");
    } catch (err) {
      setErrorMessage(String(err));
      setSubmitState("error");
    }
  }

  function copyPhrase() {
    if (claimResult?.verificationPhrase) {
      navigator.clipboard.writeText(claimResult.verificationPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const shortWallet = publicKey
    ? publicKey.toBase58().slice(0, 4) + "…" + publicKey.toBase58().slice(-4)
    : "";

  // ---- Submitted success ----
  if (submitState === "done" && claimResult) {
    return (
      <div className="claim-page">
        <div style={{ marginBottom: 20 }}>
          <Link
            href={`/creator/${creator.slug}`}
            style={{
              background: "none",
              border: "none",
              color: "var(--t2)",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            ← Back to {creator.name}
          </Link>
        </div>

        <div className="claim-card">
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 16px",
                borderRadius: 16,
                background: "var(--accent-soft)",
                border: "1px solid rgba(43,244,154,0.3)",
                display: "grid",
                placeItems: "center",
                color: "var(--accent)",
                boxShadow: "0 0 30px rgba(43,244,154,0.2)",
              }}
            >
              <CheckIcon />
            </div>
            <h2 style={{ margin: "0 0 6px" }}>Claim submitted</h2>
            <p style={{ color: "var(--t2)", fontSize: 14, margin: "0 0 20px" }}>
              Your claim is now under admin review. We typically respond within 24 hours.
            </p>

            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 16,
                textAlign: "left",
                maxWidth: 500,
                margin: "0 auto 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--t3)" }}>Status</span>
                <span className="badge b-claim">
                  <span className="badge-dot" />
                  Pending
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--t3)" }}>Claim ID</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{claimResult.claimId}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--t3)" }}>Wallet</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{shortWallet}</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
              >
                <span style={{ color: "var(--t3)" }}>Method</span>
                <span>{methodConfig.label}</span>
              </div>
            </div>

            {claimResult.verificationPhrase && (
              <div style={{ marginBottom: 16, maxWidth: 500, margin: "0 auto 16px" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--t2)",
                    marginBottom: 6,
                    fontWeight: 500,
                  }}
                >
                  Your verification phrase:
                </div>
                <div className="code-box">
                  {claimResult.verificationPhrase}
                  <button className="copy-btn" onClick={copyPhrase}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 6 }}>
                  Post this from your official account and keep it visible until approved.
                </div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <Link
                href={`/creator/${creator.slug}`}
                className="btn btn-secondary"
              >
                Back to {creator.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main stepper ----
  return (
    <div className="claim-page">
      {/* Back link */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Link
          href={`/creator/${creator.slug}`}
          style={{
            color: "var(--t2)",
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
          }}
        >
          ← Back to {creator.name}
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--t3)",
          }}
        >
          ⚔ Secured by Solana wallet signature
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--t3)",
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Take control of your coin
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 8px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {creator.name}
          {token && (
            <span
              style={{
                color: "var(--t3)",
                fontFamily: "var(--font-mono)",
                fontSize: 18,
              }}
            >
              ${token.ticker}
            </span>
          )}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--t3)",
            lineHeight: 1.5,
            borderLeft: "2px solid var(--accent)",
            paddingLeft: 10,
          }}
        >
          Your community organized this. Claim the fees and optionally add
          Pump.fun as another platform you stream to — no one leaves Twitch.
        </p>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((st, i) => (
          <div key={st.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div
              className={`step ${step === st.num ? "active" : ""} ${step > st.num ? "done" : ""}`}
              style={{ flex: 1 }}
            >
              <div className="step-num">
                {step > st.num ? <CheckIcon /> : st.num}
              </div>
              <div className="step-info">
                <div className="step-label">{st.label}</div>
                <div className="step-name">{st.name}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-bar ${step > st.num ? "done" : ""}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="claim-card">
        {/* === STEP 1: Connect wallet === */}
        {step === 1 && (
          <>
            <h2>Connect your Solana wallet</h2>
            <p className="desc">
              Your wallet is where the fees land. Once verified, your community&apos;s{" "}
              <strong style={{ color: "var(--t1)" }}>${token?.ticker ?? "community coin"}</strong>{" "}
              token routes earnings directly to you — and you can optionally
              start streaming on Pump.fun alongside your existing channels.
            </p>

            {!connected ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingBottom: 8,
                }}
              >
                <SafeWalletMultiButton
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "10px 18px",
                    height: "auto",
                    fontFamily: "var(--font-ui, inherit)",
                    border: "none",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  background: "var(--accent-soft)",
                  border: "1px solid rgba(43,244,154,0.3)",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#AB9FF2",
                    display: "grid",
                    placeItems: "center",
                    color: "#1a1a1a",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  P
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Wallet connected</div>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: "var(--t2)",
                    }}
                  >
                    {shortWallet}
                  </div>
                </div>
                <span style={{ color: "var(--accent)", fontSize: 16 }}>✓</span>
              </div>
            )}

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                disabled={!connected}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {/* === STEP 2: Details === */}
        {step === 2 && (
          <>
            <h2>Tell us who you are</h2>
            <p className="desc">
              This information is used by admin reviewers to verify your claim. Email is
              private and used only for claim correspondence.
            </p>

            <div className="field">
              <label>
                Your name <span className="req">*</span>
              </label>
              <input
                className="sc-input"
                placeholder={`e.g. ${creator.name}`}
                value={form.claimantName}
                onChange={(e) => setForm((p) => ({ ...p, claimantName: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="field">
              <label>
                Contact email <span className="req">*</span>
              </label>
              <input
                className="sc-input"
                type="email"
                placeholder="you@example.com"
                value={form.contactEmail}
                onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
              />
              <div className="hint">Used by admin for follow-up. Not shown publicly.</div>
            </div>

            <div className="field">
              <label>Your role</label>
              <div className="radio-group">
                {ROLE_OPTIONS.map((r) => (
                  <div
                    key={r.k}
                    className={`radio-card ${form.claimedRole === r.k ? "selected" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, claimedRole: r.k }))}
                  >
                    <div className="dot" />
                    {r.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Verification method</label>
              <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                Pick a platform where you control the official account.
              </div>
              <div className="radio-group">
                {METHOD_OPTIONS.map((m) => (
                  <div
                    key={m.k}
                    className={`radio-card ${form.verificationMethod === m.k ? "selected" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, verificationMethod: m.k }))}
                  >
                    <div className="dot" />
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!form.claimantName || !form.contactEmail}
                onClick={() => setStep(3)}
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {/* === STEP 3: Post phrase === */}
        {step === 3 && (
          <>
            <h2>Post this verification phrase</h2>
            <p className="desc">
              Post the exact phrase below from your official{" "}
              {methodConfig.label.toLowerCase()}. Keep it visible — admin reviewers will
              check it against your account.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--t2)",
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                Verification phrase
              </label>
              <div className="code-box">
                {`I am verifying my claim for streamcoin.io/creator/${creator.slug}`}
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `I am verifying my claim for streamcoin.io/creator/${creator.slug}`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="hint" style={{ marginTop: 8 }}>
                Must match exactly. Your unique code will be generated on submit.
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 14,
                fontSize: 12.5,
                color: "var(--t2)",
                lineHeight: 1.6,
              }}
            >
              <div
                style={{ color: "var(--t1)", fontWeight: 600, marginBottom: 6, fontSize: 13 }}
              >
                What happens next:
              </div>
              1. Post the phrase from your official account.
              <br />
              2. Leave it visible until your claim is approved.
              <br />
              3. Once approved, you can delete the post.
              <br />
              4. Admin reviews within 24 hours.
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>
                I&apos;ve posted it →
              </button>
            </div>
          </>
        )}

        {/* === STEP 4: Submit === */}
        {step === 4 && (
          <>
            <h2>Submit your proof URL</h2>
            <p className="desc">
              Paste the public URL where you posted the verification phrase. Admin
              reviewers will open it directly.
            </p>

            <div className="field">
              <label>
                Proof URL <span className="req">*</span>
              </label>
              <input
                className="sc-input mono"
                placeholder={methodConfig.placeholder}
                value={form.verificationUrl}
                onChange={(e) => setForm((p) => ({ ...p, verificationUrl: e.target.value }))}
              />
              <div className="hint">Public link only. Admin opens it as-is.</div>
            </div>

            <div className="field">
              <label>Additional context (optional)</label>
              <textarea
                className="sc-textarea"
                placeholder="Anything helpful for the reviewer — a second account, livestream link, manager contact, etc."
                value={form.additionalContext}
                onChange={(e) =>
                  setForm((p) => ({ ...p, additionalContext: e.target.value }))
                }
              />
            </div>

            <div
              className="disclaimer"
              style={{
                marginTop: 14,
                background: "var(--cyan-soft)",
                borderColor: "rgba(92,225,255,0.25)",
              }}
            >
              <div
                className="disclaimer-icon"
                style={{ background: "rgba(92,225,255,0.2)", color: "var(--cyan)" }}
              >
                ⚔
              </div>
              <div className="disclaimer-text">
                <strong style={{ color: "var(--cyan)" }}>How creator fees work:</strong>{" "}
                Verification confirms identity on this platform only. Actual on-chain fee
                routing depends on Pump.fun / PumpSwap&apos;s mechanics for the specific
                token. We display the verified wallet — we don&apos;t control distribution.
              </div>
            </div>

            {submitState === "error" && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  background: "var(--red-soft)",
                  border: "1px solid rgba(255,90,95,0.25)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--red)",
                }}
              >
                {errorMessage}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setStep(3)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!form.verificationUrl || submitState === "submitting"}
                onClick={handleSubmit}
              >
                {submitState === "submitting" ? "Signing & submitting…" : "Submit claim →"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Trust footer */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 14,
          justifyContent: "center",
          fontSize: 11.5,
          color: "var(--t3)",
        }}
      >
        <span>⚔ Wallet-signed</span>
        <span>👥 Human admin review</span>
        <span>📋 Audit-logged</span>
      </div>
    </div>
  );
}
