"use client";

import { useState } from "react";
import { useWalletAuth } from "@/components/wallet/useWalletAuth";
import type { CommunityToken } from "@/types/db";
import { PUMP_FUN_BASE_URL } from "@/config/constants";

interface Props {
  tokenId: string;
  onAttached: (token: CommunityToken) => void;
}

export function AdminAttachMint({ tokenId, onAttached }: Props) {
  const { getAuthHeader } = useWalletAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    mintAddress: "",
    pumpUrl: "",
    chartUrl: "",
    metadataUri: "",
  });

  const mintToPumpUrl = (mint: string) =>
    mint ? `${PUMP_FUN_BASE_URL}/${mint}` : "";

  const handleMintChange = (mint: string) => {
    setForm((p) => ({
      ...p,
      mintAddress: mint,
      pumpUrl: p.pumpUrl || mintToPumpUrl(mint),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mintAddress.trim()) return;

    setLoading(true);
    setError("");

    try {
      const auth = await getAuthHeader();
      const res = await fetch(`/api/admin/tokens/${tokenId}?action=attach-mint`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-auth": JSON.stringify(auth),
        },
        body: JSON.stringify({
          mintAddress: form.mintAddress.trim(),
          pumpUrl: form.pumpUrl || undefined,
          chartUrl: form.chartUrl || undefined,
          metadataUri: form.metadataUri || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to attach mint");
        return;
      }

      onAttached(data.token);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const fieldLabel = (text: string, hint?: string) => (
    <label
      style={{
        display: "block",
        fontSize: 11,
        color: "var(--t3)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.07em",
        marginBottom: 6,
      }}
    >
      {text}
      {hint && (
        <span
          style={{
            textTransform: "none",
            letterSpacing: 0,
            marginLeft: 6,
            color: "var(--t4)",
            fontSize: 10.5,
          }}
        >
          {hint}
        </span>
      )}
    </label>
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div>
        {fieldLabel("Mint Address", "*")}
        <input
          required
          value={form.mintAddress}
          onChange={(e) => handleMintChange(e.target.value)}
          className="sc-input"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
          placeholder="Token mint address from Pump.fun"
        />
      </div>

      <div>
        {fieldLabel("Pump.fun URL", "(auto-filled)")}
        <input
          value={form.pumpUrl}
          onChange={(e) => setForm((p) => ({ ...p, pumpUrl: e.target.value }))}
          className="sc-input"
          placeholder="https://pump.fun/…"
        />
      </div>

      <div>
        {fieldLabel("Chart URL", "(optional)")}
        <input
          value={form.chartUrl}
          onChange={(e) => setForm((p) => ({ ...p, chartUrl: e.target.value }))}
          className="sc-input"
          placeholder="DexScreener / Birdeye URL"
        />
      </div>

      <div>
        {fieldLabel("Metadata URI", "(optional)")}
        <input
          value={form.metadataUri}
          onChange={(e) =>
            setForm((p) => ({ ...p, metadataUri: e.target.value }))
          }
          className="sc-input"
          placeholder="https://…"
        />
      </div>

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

      <button
        type="submit"
        disabled={loading || !form.mintAddress.trim()}
        className="btn btn-primary btn-sm"
        style={{ alignSelf: "flex-start" }}
      >
        {loading ? "Saving…" : "Attach Mint"}
      </button>
    </form>
  );
}
