import { TRPCError } from "@trpc/server";

import type { KubernetesSecret } from "@homarr/definitions";

import { kubernetesMiddleware } from "../../../middlewares/kubernetes";
import { createTRPCRouter, permissionRequiredProcedure } from "../../../trpc";
import { KubernetesClient } from "../kubernetes-client";

export const secretsRouter = createTRPCRouter({
  getSecrets: permissionRequiredProcedure
    .requiresPermission("admin")
    .concat(kubernetesMiddleware())
    .query(async (): Promise<KubernetesSecret[]> => {
      const { coreApi } = KubernetesClient.getInstance();
      try {
        const secrets = await coreApi.listSecretForAllNamespaces();

        return secrets.items.map((secret) => {
          return {
            name: secret.metadata?.name ?? "unknown",
            namespace: secret.metadata?.namespace ?? "unknown",
            type: secret.type ?? "unknown",
            creationTimestamp: secret.metadata?.creationTimestamp,
          };
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes secrets",
          cause: error,
        });
      }
    }),
});
