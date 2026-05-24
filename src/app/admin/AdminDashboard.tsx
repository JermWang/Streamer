"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminCreatorForm } from "./AdminCreatorForm";
import { AdminTokenForm } from "./AdminTokenForm";
import { AdminAttachMint } from "./AdminAttachMint";
import { AdminClaimReview } from "./AdminClaimReview";
import type { Creator, CommunityToken, ClaimRequest, AdminAction } from "@/types/db";

interface AdminDashboardProps {
  initialCreators: Creator[];
  initialTokens: (CommunityToken & { creators?: { name: string; slug: string } })[];
  pendingClaims: (ClaimRequest & {
    creators?: { name: string; slug: string };
    community_tokens?: { name: string; ticker: string } | null;
  })[];
  recentActions: AdminAction[];
  adminWallet: string;
}

type Section =
  | "claims"
  | "creators"
  | "tokens"
  | "create-creator"
  | "create-token"
  | "log";

function shortAddr(addr: string): string {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
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

export function AdminDashboard({
  initialCreators,
  initialTokens,
  pendingClaims,
  recentActions,
  adminWallet,
}: AdminDashboardProps) {
  const { connected, publicKey } = useWallet();
  const [section, setSection] = useState<Section>("claims");
  const [creators, setCreators] = useState(initialCreators);
  const [tokens, setTokens] = useState(initialTokens);

  const isAdmin =
    connected &&
    publicKey?.toBase58().toLowerCase() === adminWallet.toLowerCase();

  /* ── Not connected ── */
  if (!connected) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "48px 24px",
        }}
      >
        <div
          className="module"
          style={{ maxWidth: 400, width: "100%", textAlign: "center" }}
        >
          <div className="module-head" style={{ justifyContent: "center" }}>
            <div className="module-title">Admin Dashboard</div>
          </div>
          <div className="module-body">
            <p
              style={{
                color: "var(--t2)",
                fontSize: 13,
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              Connect your admin wallet to access the dashboard.
            </p>
            <WalletMultiButton
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                padding: "8px 16px",
                height: "auto",
                width: "100%",
                justifyContent: "center",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ── Wrong wallet ── */
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "48px 24px",
        }}
      >
        <div
          className="module"
          style={{ maxWidth: 400, width: "100%", textAlign: "center" }}
        >
          <div className="module-head" style={{ justifyContent: "center" }}>
            <div
              className="module-title"
              style={{ color: "var(--red)" }}
            >
              Access Denied
            </div>
          </div>
          <div className="module-body">
            <p
              style={{
                color: "var(--t2)",
                fontSize: 13,
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              Connected wallet is not the admin wallet.
            </p>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--t3)",
                wordBreak: "break-all",
                marginBottom: 6,
              }}
            >
              {publicKey?.toBase58()}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--t4)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Expected: {adminWallet.slice(0, 8)}…{adminWallet.slice(-8)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Section metadata ── */
  const SECTIONS: {
    key: Section;
    label: string;
    icon: string;
    count?: number;
    dividerBefore?: boolean;
  }[] = [
    { key: "claims", label: "Pending Claims", icon: "◈", count: pendingClaims.length },
    { key: "creators", label: "Creators", icon: "◉", count: creators.length },
    { key: "tokens", label: "Tokens", icon: "◎", count: tokens.length },
    { key: "create-creator", label: "Add Creator", icon: "+", dividerBefore: true },
    { key: "create-token", label: "Add Token", icon: "+" },
    { key: "log", label: "Audit Log", icon: "≡", dividerBefore: true },
  ];

  const currentSection = SECTIONS.find((s) => s.key === section);

  const SECTION_SUBTITLES: Record<Section, string> = {
    claims: `${pendingClaims.length} pending review`,
    creators: `${creators.length} total`,
    tokens: `${tokens.length} total`,
    "create-creator": "Add a new creator",
    "create-token": "Draft a new token",
    log: `${recentActions.length} recent actions`,
  };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sb-section">Management</div>

        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={`sb-item ${section === s.key ? "active" : ""}`}
            onClick={() => setSection(s.key)}
            style={s.dividerBefore ? { marginTop: 12 } : undefined}
          >
            <span className="sb-icon">{s.icon}</span>
            {s.label}
            {s.count != null && (
              <span
                className="count"
                style={
                  s.key === "claims" && s.count > 0
                    ? { background: "rgba(255,90,95,0.18)", color: "var(--red)" }
                    : undefined
                }
              >
                {s.count}
              </span>
            )}
          </button>
        ))}

        {/* Admin wallet */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 16,
            paddingLeft: 14,
            paddingRight: 14,
            borderTop: "1px solid var(--border)",
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
            Admin Wallet
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--t2)",
              }}
            >
              {shortAddr(publicKey!.toBase58())}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-content">
        <div className="admin-head">
          <h1 className="admin-title">
            {currentSection?.label}
            <span className="sub">{SECTION_SUBTITLES[section]}</span>
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            {section === "creators" && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSection("create-creator")}
              >
                + Add Creator
              </button>
            )}
            {section === "tokens" && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSection("create-token")}
              >
                + Add Token
              </button>
            )}
          </div>
        </div>

        {/* ── Claims ── */}
        {section === "claims" && (
          <AdminClaimReview claims={pendingClaims} />
        )}

        {/* ── Creators table ── */}
        {section === "creators" && (
          <CreatorsTable
            creators={creators}
            tokens={tokens}
            onUpdate={(updated) =>
              setCreators((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              )
            }
          />
        )}

        {/* ── Tokens table ── */}
        {section === "tokens" && (
          <TokensTable
            tokens={tokens}
            onUpdate={(updated) =>
              setTokens((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t))
              )
            }
          />
        )}

        {/* ── Create creator ── */}
        {section === "create-creator" && (
          <div style={{ maxWidth: 600 }}>
            <AdminCreatorForm
              onCreated={(creator) => {
                setCreators((prev) => [creator, ...prev]);
                setSection("creators");
              }}
            />
          </div>
        )}

        {/* ── Create token ── */}
        {section === "create-token" && (
          <div style={{ maxWidth: 600 }}>
            <AdminTokenForm
              creators={creators}
              onCreated={(token) => {
                setTokens((prev) => [token as (typeof tokens)[0], ...prev]);
                setSection("tokens");
              }}
            />
          </div>
        )}

        {/* ── Audit log ── */}
        {section === "log" && <AuditLogTable actions={recentActions} />}
      </main>
    </div>
  );
}

/* ─────────────────── Creators table ─────────────────── */
function CreatorsTable({
  creators,
  tokens,
  onUpdate: _onUpdate,
}: {
  creators: Creator[];
  tokens: CommunityToken[];
  onUpdate: (c: Creator) => void;
}) {
  if (creators.length === 0) {
    return (
      <EmptyState
        message="No creators yet."
        hint="Use «Add Creator» to add the first one."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="sc-table">
        <thead>
          <tr>
            <th>Creator</th>
            <th>Platform</th>
            <th>Token</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {creators.map((creator) => {
            const token = tokens.find((t) => t.creator_id === creator.id);
            return (
              <tr key={creator.id}>
                <td>
                  <div className="creator-cell">
                    <div className="info">
                      <div className="name">{creator.name}</div>
                      <div className="sub">/{creator.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--t2)", fontSize: 12.5 }}>
                  {creator.platform ?? "—"}
                  {creator.primary_handle && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--t3)",
                        marginTop: 1,
                      }}
                    >
                      {creator.primary_handle}
                    </div>
                  )}
                </td>
                <td>
                  {token ? (
                    <div>
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                        ${token.ticker}
                      </span>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--t3)",
                          marginTop: 2,
                        }}
                      >
                        {token.mint_address
                          ? token.mint_address.slice(0, 6) + "…" + token.mint_address.slice(-4)
                          : "No mint"}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "var(--t4)", fontSize: 12 }}>No token</span>
                  )}
                </td>
                <td>
                  <StatusBadge status={creator.status} />
                </td>
                <td>
                  <div className="td-actions" style={{ justifyContent: "flex-end" }}>
                    <a
                      href={`/creator/${creator.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                    >
                      View →
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────── Tokens table ─────────────────── */
function TokensTable({
  tokens,
  onUpdate,
}: {
  tokens: (CommunityToken & { creators?: { name: string; slug: string } })[];
  onUpdate: (t: CommunityToken) => void;
}) {
  const [attachingId, setAttachingId] = useState<string | null>(null);

  if (tokens.length === 0) {
    return (
      <EmptyState
        message="No tokens yet."
        hint="Use «Add Token» to draft the first one."
      />
    );
  }

  return (
    <div>
      <div className="table-wrap">
        <table className="sc-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Creator</th>
              <th>Mint Address</th>
              <th>Launch</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.id}>
                <td>
                  <div className="creator-cell">
                    <div className="info">
                      <div className="name">{token.name}</div>
                      <div className="sub">${token.ticker}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--t2)", fontSize: 12.5 }}>
                  {token.creators?.name ?? "—"}
                </td>
                <td className="td-mono" style={{ color: "var(--t3)" }}>
                  {token.mint_address
                    ? token.mint_address.slice(0, 8) + "…" + token.mint_address.slice(-6)
                    : <span style={{ color: "var(--t4)" }}>Not attached</span>}
                </td>
                <td>
                  <StatusBadge status={token.launch_status} />
                </td>
                <td>
                  <div className="td-actions" style={{ justifyContent: "flex-end" }}>
                    {!token.mint_address && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setAttachingId(attachingId === token.id ? null : token.id)
                        }
                      >
                        Attach Mint
                      </button>
                    )}
                    {token.pump_url && (
                      <a
                        href={token.pump_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        Pump ↗
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline attach-mint form */}
      {attachingId && (
        <div
          className="module"
          style={{ marginTop: 16, maxWidth: 480 }}
        >
          <div className="module-head">
            <div className="module-title">Attach Mint Address</div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setAttachingId(null)}
            >
              ✕
            </button>
          </div>
          <div className="module-body">
            <AdminAttachMint
              tokenId={attachingId}
              onAttached={(updated) => {
                onUpdate(updated);
                setAttachingId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Audit log table ─────────────────── */
function AuditLogTable({ actions }: { actions: AdminAction[] }) {
  if (actions.length === 0) {
    return (
      <EmptyState
        message="No audit actions yet."
        hint="Admin actions will appear here after they're performed."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="sc-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Actor</th>
            <th>Target</th>
            <th style={{ textAlign: "right" }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <tr key={action.id}>
              <td>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {action.action_type}
                </span>
              </td>
              <td className="td-mono" style={{ color: "var(--t3)" }}>
                {action.actor_wallet.slice(0, 6)}…{action.actor_wallet.slice(-4)}
              </td>
              <td style={{ color: "var(--t2)", fontSize: 12.5 }}>
                {action.target_type}
                {action.target_id && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--t4)",
                      marginLeft: 6,
                    }}
                  >
                    {action.target_id.slice(0, 8)}
                  </span>
                )}
              </td>
              <td
                className="td-mono"
                style={{ textAlign: "right", color: "var(--t3)" }}
              >
                {timeAgo(action.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────── Shared empty state ─────────────────── */
function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div
      style={{
        padding: "48px 24px",
        textAlign: "center",
        color: "var(--t3)",
      }}
    >
      <div style={{ fontSize: 14, color: "var(--t2)", marginBottom: 6 }}>
        {message}
      </div>
      {hint && <div style={{ fontSize: 12.5 }}>{hint}</div>}
    </div>
  );
}
