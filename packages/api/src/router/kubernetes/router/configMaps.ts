import { TRPCError } from "@trpc/server";

import type { KubernetesBaseResource } from "@homarr/definitions";

import { kubernetesMiddleware } from "../../../middlewares/kubernetes";
import { createTRPCRouter, permissionRequiredProcedure } from "../../../trpc";
import { KubernetesClient } from "../kubernetes-client";

export const configMapsRouter = createTRPCRouter({
  getConfigMaps: permissionRequiredProcedure
    .requiresPermission("admin")
    .concat(kubernetesMiddleware())
    .query(async (): Promise<KubernetesBaseResource[]> => {
      const { coreApi } = KubernetesClient.getInstance();

      try {
        const configMaps = await coreApi.listConfigMapForAllNamespaces();

        return configMaps.items.map((configMap) => {
          return {
            name: configMap.metadata?.name ?? "unknown",
            namespace: configMap.metadata?.namespace ?? "unknown",
            creationTimestamp: configMap.metadata?.creationTimestamp,
          };
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes ConfigMaps",
          cause: error,
        });
      }
    }),
});
