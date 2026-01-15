import { TRPCError } from "@trpc/server";

import type { KubernetesService } from "@homarr/definitions";

import { kubernetesMiddleware } from "../../../middlewares/kubernetes";
import { createTRPCRouter, permissionRequiredProcedure } from "../../../trpc";
import { KubernetesClient } from "../kubernetes-client";

export const servicesRouter = createTRPCRouter({
  getServices: permissionRequiredProcedure
    .requiresPermission("admin")
    .concat(kubernetesMiddleware())
    .query(async (): Promise<KubernetesService[]> => {
      const { coreApi } = KubernetesClient.getInstance();

      try {
        const services = await coreApi.listServiceForAllNamespaces();

        return services.items.map((service) => {
          return {
            name: service.metadata?.name ?? "unknown",
            namespace: service.metadata?.namespace ?? "",
            type: service.spec?.type ?? "",
            ports: service.spec?.ports?.map(({ port, protocol }) => `${port}/${protocol}`),
            targetPorts: service.spec?.ports?.map(({ targetPort }) => `${targetPort}`),
            clusterIP: service.spec?.clusterIP ?? "",
            creationTimestamp: service.metadata?.creationTimestamp,
          };
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes services",
          cause: error,
        });
      }
    }),
});
