import type { Provider } from "next-auth/providers";

import { env } from "../env";

export const filterProviders = (providers: Exclude<Provider, () => unknown>[]) => {
  // During build this will be undefined, so we default to an empty array
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const authProviders = env.AUTH_PROVIDERS ?? [];

  return providers.filter((provider) => {
    if (provider.id === "empty") {
      return true;
    }

    if (
      provider.id === "credentials" &&
      ["ldap", "credentials"].some((credentialType) => authProviders.includes(credentialType))
    ) {
      return true;
    }

    return authProviders.includes(provider.id);
  });
};
