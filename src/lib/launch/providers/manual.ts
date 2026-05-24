import type { LaunchProvider, LaunchTokenInput, LaunchTokenResult, ManualLaunchChecklist } from "./types";

export const manualProvider: LaunchProvider = {
  name: "MANUAL",
  available: true,

  async createToken(_input: LaunchTokenInput): Promise<LaunchTokenResult> {
    // Manual provider never auto-launches; admin must attach mint after external launch
    return {
      success: false,
      error:
        "Manual launch mode: no automatic launch. Use the checklist below to launch on Pump.fun, then attach the mint address via the admin dashboard.",
    };
  },

  getManualChecklist(input: LaunchTokenInput): ManualLaunchChecklist {
    return {
      name: input.name,
      ticker: input.ticker,
      description: input.description,
      imageUrl: input.imageUrl,
      creatorWallet: input.creatorWallet,
      initialBuySol: input.initialBuySol,
      suggestedDisclaimer: `Unofficial community token named after the creator. Not affiliated with, endorsed by, sponsored by, or controlled by the creator unless marked Verified.`,
      instructions: [
        `1. Go to https://pump.fun`,
        `2. Click "Create Token"`,
        `3. Set Name: "${input.name}"`,
        `4. Set Ticker/Symbol: "${input.ticker}"`,
        `5. Set Description: "${input.description}"`,
        `6. Upload image from: ${input.imageUrl}`,
        ...(input.creatorWallet
          ? [`7. Set creator/community wallet: ${input.creatorWallet}`]
          : []),
        ...(input.initialBuySol
          ? [`8. Set initial buy: ${input.initialBuySol} SOL`]
          : []),
        `9. Deploy the token`,
        `10. Copy the mint address from the resulting URL`,
        `11. Return to admin dashboard and use "Attach Mint" to save the mint address and Pump.fun URL`,
      ],
    };
  },
};
