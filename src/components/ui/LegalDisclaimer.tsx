import { DEFAULT_DISCLAIMER, VERIFIED_DISCLAIMER } from "@/config/constants";

interface LegalDisclaimerProps {
  creatorName: string;
  verified: boolean;
  className?: string;
}

export function LegalDisclaimer({ creatorName, verified, className = "" }: LegalDisclaimerProps) {
  const text = verified
    ? VERIFIED_DISCLAIMER(creatorName)
    : DEFAULT_DISCLAIMER(creatorName);

  if (verified) {
    return (
      <div
        className={`disclaimer ${className}`}
        style={{
          background: "var(--accent-soft)",
          borderColor: "rgba(43,244,154,0.22)",
        }}
        role="note"
        aria-label="Verification status"
      >
        <div
          className="disclaimer-icon"
          style={{ background: "rgba(43,244,154,0.15)", color: "var(--accent)" }}
        >
          ✓
        </div>
        <div className="disclaimer-text" style={{ color: "var(--t1)" }}>
          <strong style={{ color: "var(--accent)" }}>Verified creator.</strong>{" "}
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className={`disclaimer ${className}`} role="note" aria-label="Legal disclaimer">
      <div className="disclaimer-icon">!</div>
      <div className="disclaimer-text">
        <strong>Unofficial community token.</strong>{" "}
        {text}
      </div>
    </div>
  );
}
