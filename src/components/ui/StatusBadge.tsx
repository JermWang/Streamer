import type { TokenLaunchStatus, CreatorStatus } from "@/types/db";

type BadgeStatus = TokenLaunchStatus | CreatorStatus | string;

interface BadgeConfig {
  cls: string;
  label: string;
  dot: boolean;
}

const STATUS_BADGE: Record<string, BadgeConfig> = {
  DRAFT:                { cls: "b-draft",     label: "Draft",             dot: false },
  LAUNCH_PENDING:       { cls: "b-draft",     label: "Launch Pending",    dot: true  },
  LIVE_UNCLAIMED:       { cls: "b-unclaimed", label: "Unclaimed",         dot: true  },
  CLAIM_REQUESTED:      { cls: "b-claim",     label: "Claim Requested",   dot: true  },
  CREATOR_VERIFIED:     { cls: "b-verified",  label: "Creator Verified",  dot: true  },
  OFFICIAL_PARTNER:     { cls: "b-partner",   label: "Official Partner",  dot: true  },
  DISPUTED:             { cls: "b-disputed",  label: "Disputed",          dot: true  },
  ARCHIVED:             { cls: "b-archived",  label: "Archived",          dot: false },
  UNCLAIMED:            { cls: "b-unclaimed", label: "Unclaimed",         dot: true  },
  UNOFFICIAL_COMMUNITY: { cls: "b-community", label: "Community Token",   dot: true  },
  LIVE:                 { cls: "b-live",      label: "LIVE",              dot: true  },
  // claim statuses
  PENDING:              { cls: "b-claim",     label: "Pending",           dot: true  },
  NEEDS_MORE_PROOF:     { cls: "b-unclaimed", label: "Needs Proof",       dot: true  },
  APPROVED:             { cls: "b-verified",  label: "Approved",          dot: true  },
  REJECTED:             { cls: "b-disputed",  label: "Rejected",          dot: true  },
  CANCELLED:            { cls: "b-archived",  label: "Cancelled",         dot: false },
};

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_BADGE[status] ?? { cls: "b-draft", label: status, dot: false };

  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.dot && <span className="badge-dot" />}
      {cfg.label}
    </span>
  );
}
