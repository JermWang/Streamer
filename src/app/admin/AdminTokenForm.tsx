"use client";

import { useState } from "react";
import { useWalletAuth } from "@/components/wallet/useWalletAuth";
import {
  sanitizeTicker,
  tickerWarnings,
  generateCreatorSlug,
} from "@/lib/metadata/generator";
import type { Creator, CommunityToken } from "@/types/db";

interface Props {
  creators: Creator[];
  onCreated: (token: CommunityToken) => void;
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
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
      {children}
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
}

export function AdminTokenForm({ creators, onCreated }: Props) {
  const { getAuthHeader } = useWalletAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [launchResult, setLaunchResult] = useState<unknown>(null);
  const [form, setForm] = useState({
    creatorId: creators[0]?.id ?? "",
    name: "",
    ticker: "",
    description: "",
    slug: "",
    imageUrl: "",
    creatorFeeWallet: "",
    creatorFeeNotes: "",
  });

  const tickerWarn = form.ticker ? tickerWarnings(form.ticker) : [];
  const sanitized = form.ticker ? sanitizeTicker(form.ticker) : "";

  const handleCreatorChange = (creatorId: string) => {
    const creator = creators.find((c) => c.id === creatorId);
    if (!creator) return;
    const suggestedSlug = generateCreatorSlug(creator.name) + "-coin";
    setForm((p) => ({
      ...p,
      creatorId,
      name: `${creator.name} Community Coin`,
      ticker: (creator.primary_handle || creator.name)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10),
      description: `Unofficial community token named after ${creator.name}. Not affiliated with, endorsed by, sponsored by, or controlled by ${creator.name} unless marked Verified.`,
      slug: p.slug || suggestedSlug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWarnings([]);

    try {
      const auth = await getAuthHeader();
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-auth": JSON.stringify(auth),
        },
        body: JSON.stringify({
          creatorId: form.creatorId,
          name: form.name,
          ticker: form.ticker,
          description: form.description,
          slug: form.slug,
          imageUrl: form.imageUrl || undefined,
          creatorFeeWallet: form.creatorFeeWallet || undefined,
          creatorFeeNotes: form.creatorFeeNotes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create token");
        return;
      }

      if (data.warnings?.length) setWarnings(data.warnings);
      onCreated(data.token);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (tokenId: string) => {
    setLoading(true);
    setError("");
    try {
      const auth = await getAuthHeader();
      const res = await fetch(`/api/admin/tokens/${tokenId}?action=launch`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-auth": JSON.stringify(auth),
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      setLaunchResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Suppress unused warning — handleLaunch is kept for future use
  void handleLaunch;

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div>
        <FieldLabel>Creator *</FieldLabel>
        <select
          required
          value={form.creatorId}
          onChange={(e) => handleCreatorChange(e.target.value)}
          className="sc-select"
        >
          {creators.length === 0 && (
            <option value="">No creators — add one first</option>
          )}
          {creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <FieldLabel>Token Name *</FieldLabel>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="sc-input"
            maxLength={32}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--t4)",
              marginTop: 4,
              fontFamily: "var(--font-mono)",
            }}
          >
            {form.name.length}/32
          </div>
        </div>
        <div>
          <FieldLabel>Ticker *</FieldLabel>
          <input
            required
            value={form.ticker}
            onChange={(e) =>
              setForm((p) => ({ ...p, ticker: e.target.value }))
            }
            className="sc-input"
            style={{ fontFamily: "var(--font-mono)" }}
            maxLength={10}
            placeholder="KAICENAT"
          />
          {sanitized && sanitized !== form.ticker.toUpperCase() && (
            <div
              style={{
                fontSize: 11,
                color: "var(--amber)",
                marginTop: 4,
                fontFamily: "var(--font-mono)",
              }}
            >
              → sanitized: {sanitized}
            </div>
          )}
        </div>
      </div>

      {tickerWarn.map((w, i) => (
        <div
          key={i}
          className="disclaimer"
          style={{
            background: "rgba(245,165,36,0.08)",
            borderColor: "rgba(245,165,36,0.25)",
          }}
        >
          <div
            className="disclaimer-icon"
            style={{
              background: "rgba(245,165,36,0.15)",
              color: "var(--amber)",
            }}
          >
            ⚠
          </div>
          <div className="disclaimer-text" style={{ color: "var(--amber)" }}>
            {w}
          </div>
        </div>
      ))}

      <div>
        <FieldLabel hint="(auto-generated)">Slug *</FieldLabel>
        <input
          required
          value={form.slug}
          onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          className="sc-input"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}
          pattern="[a-z0-9-]+"
          placeholder="kai-cenat-coin"
        />
      </div>

      <div>
        <FieldLabel>Description *</FieldLabel>
        <textarea
          required
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          className="sc-textarea"
          rows={3}
          maxLength={500}
        />
        <div
          style={{
            fontSize: 11,
            color: "var(--t4)",
            marginTop: 4,
            fontFamily: "var(--font-mono)",
          }}
        >
          {form.description.length}/500
        </div>
      </div>

      <div>
        <FieldLabel hint="(required for Pump.fun)">Image URL</FieldLabel>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) =>
            setForm((p) => ({ ...p, imageUrl: e.target.value }))
          }
          className="sc-input"
          placeholder="https://..."
        />
        <div
          style={{
            fontSize: 11,
            color: "var(--t4)",
            marginTop: 4,
          }}
        >
          Must be publicly accessible for launch providers.
        </div>
      </div>

      <div>
        <FieldLabel hint="(optional)">Creator Fee Wallet</FieldLabel>
        <input
          value={form.creatorFeeWallet}
          onChange={(e) =>
            setForm((p) => ({ ...p, creatorFeeWallet: e.target.value }))
          }
          className="sc-input"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}
          placeholder="Solana wallet address"
        />
        <div
          style={{
            fontSize: 11,
            color: "var(--t4)",
            marginTop: 4,
          }}
        >
          For tracking only — actual routing depends on provider capabilities.
        </div>
      </div>

      <div>
        <FieldLabel hint="(optional)">Fee Notes</FieldLabel>
        <input
          value={form.creatorFeeNotes}
          onChange={(e) =>
            setForm((p) => ({ ...p, creatorFeeNotes: e.target.value }))
          }
          className="sc-input"
          placeholder="Notes about fee arrangement"
          maxLength={500}
        />
      </div>

      {warnings.map((w, i) => (
        <div
          key={i}
          className="disclaimer"
          style={{
            background: "rgba(245,165,36,0.08)",
            borderColor: "rgba(245,165,36,0.25)",
          }}
        >
          <div
            className="disclaimer-icon"
            style={{
              background: "rgba(245,165,36,0.15)",
              color: "var(--amber)",
            }}
          >
            ⚠
          </div>
          <div className="disclaimer-text" style={{ color: "var(--amber)" }}>
            {w}
          </div>
        </div>
      ))}

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

      {launchResult !== null && (
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "12px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            color: "var(--t2)",
            overflow: "auto",
            maxHeight: 240,
          }}
        >
          <pre style={{ margin: 0 }}>
            {JSON.stringify(launchResult as Record<string, unknown>, null, 2)}
          </pre>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || creators.length === 0}
        className="btn btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        {loading ? "Creating…" : "Create Draft Token"}
      </button>
    </form>
  );
}
