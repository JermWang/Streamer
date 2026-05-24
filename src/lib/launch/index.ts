import { manualProvider } from "./providers/manual";
import { getPumpPortalProvider } from "./providers/pumpportal";
import type { LaunchProvider } from "./providers/types";

export function getLaunchProvider(): LaunchProvider {
  const pumpPortalKey = process.env.PUMPPORTAL_API_KEY;
  const pp = getPumpPortalProvider(pumpPortalKey);
  if (pp) return pp;
  return manualProvider;
}

export type { LaunchProvider, LaunchTokenInput, LaunchTokenResult, ManualLaunchChecklist } from "./providers/types";
