"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { buildSignInMessage, generateNonce } from "@/lib/auth/wallet";
import bs58 from "bs58";

export interface WalletAuthHeader {
  publicKey: string;
  signature: string;
  message: string;
}

export function useWalletAuth() {
  const { publicKey, signMessage, connected } = useWallet();

  const getAuthHeader = useCallback(async (): Promise<WalletAuthHeader> => {
    if (!connected || !publicKey || !signMessage) {
      throw new Error("Wallet not connected");
    }

    const nonce = generateNonce();
    const timestamp = Date.now();
    const message = buildSignInMessage(nonce, timestamp);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = await signMessage(messageBytes);
    const signature = bs58.encode(signatureBytes);

    return {
      publicKey: publicKey.toBase58(),
      signature,
      message,
    };
  }, [connected, publicKey, signMessage]);

  return {
    connected,
    publicKey: publicKey?.toBase58() ?? null,
    getAuthHeader,
  };
}
