import { TRPCError } from "@trpc/server";

import type { KubernetesNamespace, KubernetesNamespaceState } from "@homarr/definitions";

import { kubernetesMiddleware } from "../../../middlewares/kubernetes";
import { createTRPCRouter, permissionRequiredProcedure } from "../../../trpc";
import { KubernetesClient } from "../kubernetes-client";

export const namespacesRouter = createTRPCRouter({
  getNamespaces: permissionRequiredProcedure
    .requiresPermission("admin")
    .concat(kubernetesMiddleware())
    .query(async (): Promise<KubernetesNamespace[]> => {
      const { coreApi } = KubernetesClient.getInstance();

      try {
        const namespaces = await coreApi.listNamespace();

        return namespaces.items.map((namespace) => {
          return {
            status: namespace.status?.phase as KubernetesNamespaceState,
            name: namespace.metadata?.name ?? "unknown",
            creationTimestamp: namespace.metadata?.creationTimestamp,
          } satisfies KubernetesNamespace;
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes namespaces",
          cause: error,
        });
      }
    }),
});
