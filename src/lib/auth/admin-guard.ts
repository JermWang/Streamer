import { NextRequest } from "next/server";
import { verifyWalletSignature, isAdminWallet } from "./wallet";

export interface AuthResult {
  authorized: boolean;
  publicKey?: string;
  error?: string;
}

export async function verifyAdminRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("x-wallet-auth");
  if (!authHeader) return { authorized: false, error: "Missing auth header" };

  try {
    const { publicKey, signature, message } = JSON.parse(authHeader);
    if (!publicKey || !signature || !message) {
      return { authorized: false, error: "Malformed auth header" };
    }

    const result = verifyWalletSignature(message, signature, publicKey);
    if (!result.valid) return { authorized: false, error: result.error };

    if (!isAdminWallet(publicKey)) {
      return { authorized: false, error: "Not an admin wallet" };
    }

    return { authorized: true, publicKey };
  } catch {
    return { authorized: false, error: "Invalid auth header format" };
  }
}

export async function verifyAnyWalletRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("x-wallet-auth");
  if (!authHeader) return { authorized: false, error: "Missing auth header" };

  try {
    const { publicKey, signature, message } = JSON.parse(authHeader);
    if (!publicKey || !signature || !message) {
      return { authorized: false, error: "Malformed auth header" };
    }

    const result = verifyWalletSignature(message, signature, publicKey);
    if (!result.valid) return { authorized: false, error: result.error };

    return { authorized: true, publicKey };
  } catch {
    return { authorized: false, error: "Invalid auth header format" };
  }
}
