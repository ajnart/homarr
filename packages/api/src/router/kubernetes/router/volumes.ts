import { TRPCError } from "@trpc/server";

import type { KubernetesVolume } from "@homarr/definitions";

import { kubernetesMiddleware } from "../../../middlewares/kubernetes";
import { createTRPCRouter, permissionRequiredProcedure } from "../../../trpc";
import { KubernetesClient } from "../kubernetes-client";

export const volumesRouter = createTRPCRouter({
  getVolumes: permissionRequiredProcedure
    .requiresPermission("admin")
    .concat(kubernetesMiddleware())
    .query(async (): Promise<KubernetesVolume[]> => {
      const { coreApi } = KubernetesClient.getInstance();

      try {
        const volumes = await coreApi.listPersistentVolumeClaimForAllNamespaces();

        return volumes.items.map((volume) => {
          return {
            name: volume.metadata?.name ?? "unknown",
            namespace: volume.metadata?.namespace ?? "unknown",
            accessModes: volume.status?.accessModes?.map((accessMode) => accessMode) ?? [],
            storage: volume.status?.capacity?.storage ?? "",
            storageClassName: volume.spec?.storageClassName ?? "",
            volumeMode: volume.spec?.volumeMode ?? "",
            volumeName: volume.spec?.volumeName ?? "",
            status: volume.status?.phase ?? "",
            creationTimestamp: volume.metadata?.creationTimestamp,
          };
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes Volumes",
          cause: error,
        });
      }
    }),
});
