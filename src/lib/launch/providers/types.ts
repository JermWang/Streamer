export interface LaunchTokenInput {
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  metadataUri?: string;
  initialBuySol?: number;
  creatorWallet?: string;
}

export interface LaunchTokenResult {
  success: boolean;
  mintAddress?: string;
  transactionSignature?: string;
  pumpUrl?: string;
  raw?: unknown;
  error?: string;
}

export interface ManualLaunchChecklist {
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  creatorWallet?: string;
  initialBuySol?: number;
  suggestedDisclaimer: string;
  instructions: string[];
}

export interface LaunchProvider {
  name: string;
  available: boolean;
  createToken(input: LaunchTokenInput): Promise<LaunchTokenResult>;
  getManualChecklist(input: LaunchTokenInput): ManualLaunchChecklist;
}
