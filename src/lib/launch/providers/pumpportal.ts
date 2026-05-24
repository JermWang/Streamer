import { PUMPPORTAL_API_BASE } from "@/config/constants";
import type { LaunchProvider, LaunchTokenInput, LaunchTokenResult, ManualLaunchChecklist } from "./types";
import { manualProvider } from "./manual";

// PumpPortal token creation docs: https://pumpportal.fun/trading-api/token-creation
// NOTE: PumpPortal token creation requires the deployer keypair to sign the transaction.
// For MVP, we support the "create-token" endpoint which returns a partially-signed
// transaction that must be completed by a wallet. Since we cannot sign server-side
// without a stored keypair (which we do NOT do), this flow requires the admin to
// complete signing client-side. This provider prepares and validates the payload;
// actual transaction broadcast happens in the admin UI component.

export function createPumpPortalProvider(apiKey: string): LaunchProvider {
  return {
    name: "PUMPPORTAL",
    available: true,

    async createToken(input: LaunchTokenInput): Promise<LaunchTokenResult> {
      // PumpPortal requires metadata to be hosted before token creation.
      // If metadataUri is not provided, we cannot proceed automatically.
      if (!input.metadataUri) {
        return {
          success: false,
          error:
            "PumpPortal requires a hosted metadataUri. Upload token metadata first and provide the URI.",
        };
      }

      try {
        const payload = {
          name: input.name,
          symbol: input.ticker,
          description: input.description,
          image: input.imageUrl,
          metadataUri: input.metadataUri,
          ...(input.initialBuySol !== undefined && {
            initialBuyAmount: input.initialBuySol,
          }),
        };

        const res = await fetch(`${PUMPPORTAL_API_BASE}/create-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          return { success: false, error: `PumpPortal error ${res.status}: ${errText}` };
        }

        const data = (await res.json()) as {
          mint?: string;
          signature?: string;
          error?: string;
        };

        if (data.error) return { success: false, error: data.error, raw: data };

        if (!data.mint) {
          return {
            success: false,
            error: "PumpPortal returned no mint address. Transaction may need client-side signing.",
            raw: data,
          };
        }

        return {
          success: true,
          mintAddress: data.mint,
          transactionSignature: data.signature,
          pumpUrl: `https://pump.fun/${data.mint}`,
          raw: data,
        };
      } catch (e) {
        return { success: false, error: `Network error: ${String(e)}` };
      }
    },

    getManualChecklist(input: LaunchTokenInput): ManualLaunchChecklist {
      return manualProvider.getManualChecklist(input);
    },
  };
}

// Returns PumpPortal provider if API key is configured, otherwise null
export function getPumpPortalProvider(apiKey?: string): LaunchProvider | null {
  if (!apiKey) return null;
  return createPumpPortalProvider(apiKey);
}
