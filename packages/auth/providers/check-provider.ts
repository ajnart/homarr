import type { SupportedAuthProvider } from "@homarr/definitions";

import { env } from "../env";

export const isProviderEnabled = (provider: SupportedAuthProvider) => {
  // The question mark is placed there because isProviderEnabled is called during static build of about page
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return env.AUTH_PROVIDERS?.includes(provider);
};
