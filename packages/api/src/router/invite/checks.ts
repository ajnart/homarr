import { TRPCError } from "@trpc/server";

import { env } from "@homarr/auth/env";

export const throwIfCredentialsDisabled = () => {
  if (!env.AUTH_PROVIDERS.includes("credentials")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Credentials provider is disabled",
    });
  }
};
