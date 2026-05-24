"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  return (
    <WalletMultiButton
      style={{
        background: "var(--accent)",
        color: "var(--accent-ink)",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        padding: "7px 12px",
        height: "auto",
        lineHeight: "1.4",
        fontFamily: "var(--font-ui, inherit)",
        border: "none",
        letterSpacing: "-0.01em",
        gap: "8px",
      }}
    />
  );
}
