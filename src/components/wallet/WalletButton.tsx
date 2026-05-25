"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface SafeWalletMultiButtonProps {
  style?: CSSProperties;
}

export function SafeWalletMultiButton({ style }: SafeWalletMultiButtonProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <button type="button" style={style} disabled aria-label="Connect wallet">
        Connect Wallet
      </button>
    );
  }

  return <WalletMultiButton style={style} />;
}

export function WalletButton() {
  return (
    <SafeWalletMultiButton
      style={{
        background: "rgba(21, 21, 29, 0.58)",
        color: "var(--t1)",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "600",
        padding: "8px 13px",
        height: "36px",
        lineHeight: "1.4",
        fontFamily: "var(--font-ui, inherit)",
        border: "1px solid var(--border-strong)",
        letterSpacing: "-0.01em",
        gap: "8px",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 18px rgba(43,244,154,0.08)",
        backdropFilter: "blur(14px)",
      }}
    />
  );
}
