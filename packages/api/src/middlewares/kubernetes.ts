import { TRPCError } from "@trpc/server";

import { env } from "@homarr/docker/env";

import { publicProcedure } from "../trpc";

export const kubernetesMiddleware = () => {
  return publicProcedure.use(async ({ next }) => {
    if (env.ENABLE_KUBERNETES) {
      return await next();
    }
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Kubernetes route is not available",
    });
  });
};
