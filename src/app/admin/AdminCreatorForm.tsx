"use client";

import { useState } from "react";
import { useWalletAuth } from "@/components/wallet/useWalletAuth";
import { generateCreatorSlug } from "@/lib/metadata/generator";
import type { Creator } from "@/types/db";

interface Props {
  onCreated: (creator: Creator) => void;
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

export function AdminCreatorForm({ onCreated }: Props) {
  const { getAuthHeader } = useWalletAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    primary_handle: "",
    platform: "TWITCH" as string,
    platform_url: "",
    avatar_url: "",
    bio: "",
  });

  const handleNameChange = (name: string) => {
    setForm((p) => ({
      ...p,
      name,
      slug: p.slug || generateCreatorSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const auth = await getAuthHeader();
      const res = await fetch("/api/admin/creators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-auth": JSON.stringify(auth),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create creator");
        return;
      }

      onCreated(data.creator);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <FieldLabel>Name *</FieldLabel>
          <input
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="sc-input"
            placeholder="Kai Cenat"
          />
        </div>
        <div>
          <FieldLabel hint="(auto-generated)">Slug *</FieldLabel>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="sc-input"
            style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}
            placeholder="kaicenat"
            pattern="[a-z0-9-]+"
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <FieldLabel>Handle</FieldLabel>
          <input
            value={form.primary_handle}
            onChange={(e) =>
              setForm((p) => ({ ...p, primary_handle: e.target.value }))
            }
            className="sc-input"
            placeholder="@KaiCenat"
          />
        </div>
        <div>
          <FieldLabel>Platform</FieldLabel>
          <select
            value={form.platform}
            onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
            className="sc-select"
          >
            <option value="TWITCH">Twitch</option>
            <option value="KICK">Kick</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="X">X / Twitter</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div>
        <FieldLabel>Platform URL</FieldLabel>
        <input
          type="url"
          value={form.platform_url}
          onChange={(e) =>
            setForm((p) => ({ ...p, platform_url: e.target.value }))
          }
          className="sc-input"
          placeholder="https://twitch.tv/kaicenat"
        />
      </div>

      <div>
        <FieldLabel>Avatar URL</FieldLabel>
        <input
          type="url"
          value={form.avatar_url}
          onChange={(e) =>
            setForm((p) => ({ ...p, avatar_url: e.target.value }))
          }
          className="sc-input"
          placeholder="https://..."
        />
      </div>

      <div>
        <FieldLabel hint="(no HTML)">Bio</FieldLabel>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          className="sc-textarea"
          rows={3}
          maxLength={500}
          placeholder="Short bio..."
        />
        <div
          style={{
            fontSize: 11,
            color: "var(--t4)",
            marginTop: 4,
            fontFamily: "var(--font-mono)",
          }}
        >
          {form.bio.length}/500
        </div>
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
            style={{
              background: "rgba(255,90,95,0.15)",
              color: "var(--red)",
            }}
          >
            !
          </div>
          <div
            className="disclaimer-text"
            style={{ color: "var(--red)" }}
          >
            {error}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
        style={{ alignSelf: "flex-start" }}
      >
        {loading ? "Creating…" : "Create Creator"}
      </button>
    </form>
  );
}
