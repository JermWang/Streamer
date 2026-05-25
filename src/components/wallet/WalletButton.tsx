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
