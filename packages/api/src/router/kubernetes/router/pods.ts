import type { KubeConfig, V1OwnerReference } from "@kubernetes/client-node";
import { AppsV1Api } from "@kubernetes/client-node";
import { TRPCError } from "@trpc/server";

import { createLogger } from "@homarr/core/infrastructure/logs";
import type { KubernetesPod } from "@homarr/definitions";

import { kubernetesMiddleware } from "../../../middlewares/kubernetes";
import { createTRPCRouter, permissionRequiredProcedure } from "../../../trpc";
import { KubernetesClient } from "../kubernetes-client";

const logger = createLogger({ module: "podsRouter" });

export const podsRouter = createTRPCRouter({
  getPods: permissionRequiredProcedure
    .requiresPermission("admin")
    .concat(kubernetesMiddleware())
    .query(async (): Promise<KubernetesPod[]> => {
      const { coreApi, kubeConfig } = KubernetesClient.getInstance();
      try {
        const podsResp = await coreApi.listPodForAllNamespaces();

        const pods: KubernetesPod[] = [];

        for (const pod of podsResp.items) {
          const labels = pod.metadata?.labels ?? {};
          const ownerRefs = pod.metadata?.ownerReferences ?? [];

          let applicationType = "Pod";

          if (labels["app.kubernetes.io/managed-by"] === "Helm") {
            applicationType = "Helm";
          } else {
            for (const owner of ownerRefs) {
              if (["Deployment", "StatefulSet", "DaemonSet"].includes(owner.kind)) {
                applicationType = owner.kind;
                break;
              } else if (owner.kind === "ReplicaSet") {
                const ownerType = await getOwnerKind(kubeConfig, owner, pod.metadata?.namespace ?? "");
                if (ownerType) {
                  applicationType = ownerType;
                  break;
                }
              }
            }
          }

          pods.push({
            name: pod.metadata?.name ?? "",
            namespace: pod.metadata?.namespace ?? "",
            image: pod.spec?.containers.map((container) => container.image).join(", "),
            applicationType,
            status: pod.status?.phase ?? "unknown",
            creationTimestamp: pod.metadata?.creationTimestamp,
          });
        }

        return pods;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes pods",
          cause: error,
        });
      }
    }),
});

async function getOwnerKind(
  kubeConfig: KubeConfig,
  ownerRef: V1OwnerReference,
  namespace: string,
): Promise<string | null> {
  const { kind, name } = ownerRef;

  if (kind === "ReplicaSet") {
    const appsApi = kubeConfig.makeApiClient(AppsV1Api);
    try {
      const rsResp = await appsApi.readNamespacedReplicaSet({
        name,
        namespace,
      });

      if (rsResp.metadata?.ownerReferences) {
        for (const rsOwner of rsResp.metadata.ownerReferences) {
          if (rsOwner.kind === "Deployment") {
            return "Deployment";
          }
          const parentKind = await getOwnerKind(kubeConfig, rsOwner, namespace);
          if (parentKind) return parentKind;
        }
      }
      return "ReplicaSet";
    } catch (error) {
      logger.error("Error reading ReplicaSet:", error);
      return null;
    }
  }

  if (["Deployment", "StatefulSet", "DaemonSet"].includes(kind)) {
    return kind;
  }

  return null;
}
