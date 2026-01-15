import type { V1HTTPIngressPath, V1Ingress, V1IngressRule } from "@kubernetes/client-node";
import { TRPCError } from "@trpc/server";

import type { KubernetesIngress, KubernetesIngressPath, KubernetesIngressRuleAndPath } from "@homarr/definitions";

import { kubernetesMiddleware } from "../../../middlewares/kubernetes";
import { createTRPCRouter, permissionRequiredProcedure } from "../../../trpc";
import { KubernetesClient } from "../kubernetes-client";

export const ingressesRouter = createTRPCRouter({
  getIngresses: permissionRequiredProcedure
    .requiresPermission("admin")
    .concat(kubernetesMiddleware())
    .query(async (): Promise<KubernetesIngress[]> => {
      const { networkingApi } = KubernetesClient.getInstance();
      try {
        const ingresses = await networkingApi.listIngressForAllNamespaces();

        const mapIngress = (ingress: V1Ingress): KubernetesIngress => {
          return {
            name: ingress.metadata?.name ?? "",
            namespace: ingress.metadata?.namespace ?? "",
            className: ingress.spec?.ingressClassName ?? "",
            rulesAndPaths: getIngressRulesAndPaths(ingress.spec?.rules ?? []),
            creationTimestamp: ingress.metadata?.creationTimestamp,
          };
        };

        const getIngressRulesAndPaths = (rules: V1IngressRule[] = []): KubernetesIngressRuleAndPath[] => {
          return rules.map((rule) => ({
            host: rule.host ?? "",
            paths: getPaths(rule.http?.paths ?? []),
          }));
        };

        const getPaths = (paths: V1HTTPIngressPath[] = []): KubernetesIngressPath[] => {
          return paths.map((path) => ({
            serviceName: path.backend.service?.name ?? "",
            port: path.backend.service?.port?.number ?? 0,
          }));
        };

        return ingresses.items.map(mapIngress);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes ingresses",
          cause: error,
        });
      }
    }),
});
