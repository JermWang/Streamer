import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { getServerEnv } from "@/config/env";
import { SITE_NAME } from "@/config/constants";

export function buildSignInMessage(nonce: string, timestamp: number): string {
  return `Sign in to ${SITE_NAME} at ${timestamp} with nonce ${nonce}`;
}

export function generateNonce(): string {
  const bytes = nacl.randomBytes(16);
  return Buffer.from(bytes).toString("hex");
}

export interface VerifySignatureResult {
  valid: boolean;
  publicKey?: string;
  error?: string;
}

export function verifyWalletSignature(
  message: string,
  signatureBase58: string,
  publicKeyBase58: string
): VerifySignatureResult {
  try {
    const pubkey = new PublicKey(publicKeyBase58);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signatureBase58);
    const publicKeyBytes = pubkey.toBytes();

    const valid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!valid) return { valid: false, error: "Invalid signature" };
    return { valid: true, publicKey: publicKeyBase58 };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}

export function isAdminWallet(publicKey: string): boolean {
  const env = getServerEnv();
  return (
    env.platformAdminWallet.toLowerCase() === publicKey.toLowerCase()
  );
}
