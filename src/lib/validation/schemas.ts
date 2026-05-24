import { z } from "zod";

export const CreateClaimSchema = z.object({
  creatorSlug: z.string().min(1).max(100),
  claimantWallet: z.string().min(32).max(44),
  contactEmail: z.string().email().optional().or(z.literal("")),
  claimantName: z.string().min(1).max(100).optional(),
  claimedRole: z.enum(["CREATOR", "MANAGER", "AGENCY", "OTHER"]),
  verificationMethod: z.enum([
    "X_POST",
    "TWITCH_PROFILE",
    "KICK_PROFILE",
    "YOUTUBE_PROFILE",
    "MANUAL",
  ]),
  verificationUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  signature: z.string().min(1),
  message: z.string().min(1),
});

export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;

export const CreateCreatorSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  primary_handle: z.string().max(100).optional(),
  platform: z.enum(["TWITCH", "KICK", "YOUTUBE", "X", "OTHER"]).optional(),
  platform_url: z.string().url().optional().or(z.literal("")),
  avatar_url: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
});

export type CreateCreatorInput = z.infer<typeof CreateCreatorSchema>;

export const CreateTokenSchema = z.object({
  creatorId: z.string().uuid(),
  name: z.string().min(1).max(32),
  ticker: z.string().min(1).max(10),
  description: z.string().min(1).max(500),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  imageUrl: z.string().url().optional().or(z.literal("")),
  creatorFeeWallet: z.string().optional(),
  creatorFeeNotes: z.string().max(500).optional(),
  initialBuySol: z.number().min(0).max(100).optional(),
});

export type CreateTokenInput = z.infer<typeof CreateTokenSchema>;

export const AttachMintSchema = z.object({
  mintAddress: z.string().min(32).max(44),
  pumpUrl: z.string().url().optional().or(z.literal("")),
  chartUrl: z.string().url().optional().or(z.literal("")),
  metadataUri: z.string().url().optional().or(z.literal("")),
});

export type AttachMintInput = z.infer<typeof AttachMintSchema>;

export const ApproveClaimSchema = z.object({
  adminNotes: z.string().max(1000).optional(),
});

export const RejectClaimSchema = z.object({
  adminNotes: z.string().max(1000).optional(),
  needsMoreProof: z.boolean().optional(),
});

export const UpdateCreatorSchema = CreateCreatorSchema.partial().extend({
  status: z
    .enum([
      "UNCLAIMED",
      "CLAIM_REQUESTED",
      "CREATOR_VERIFIED",
      "OFFICIAL_PARTNER",
      "DISPUTED",
    ])
    .optional(),
  verified_wallet: z.string().optional(),
});

export const UpdateTokenSchema = z.object({
  name: z.string().min(1).max(32).optional(),
  ticker: z.string().min(1).max(10).optional(),
  description: z.string().min(1).max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  launch_status: z
    .enum([
      "DRAFT",
      "LAUNCH_PENDING",
      "LIVE_UNCLAIMED",
      "CLAIM_REQUESTED",
      "CREATOR_VERIFIED",
      "OFFICIAL_PARTNER",
      "DISPUTED",
      "ARCHIVED",
    ])
    .optional(),
  creator_fee_wallet: z.string().optional(),
  creator_fee_notes: z.string().max(500).optional(),
});
