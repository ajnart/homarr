import type { V1NodeList, VersionInfo } from "@kubernetes/client-node";
import { TRPCError } from "@trpc/server";

import type { ClusterResourceCount, KubernetesCluster } from "@homarr/definitions";

import { kubernetesMiddleware } from "../../../middlewares/kubernetes";
import { createTRPCRouter, permissionRequiredProcedure } from "../../../trpc";
import { KubernetesClient } from "../kubernetes-client";
import { CpuResourceParser } from "../resource-parser/cpu-resource-parser";
import { MemoryResourceParser } from "../resource-parser/memory-resource-parser";

export const clusterRouter = createTRPCRouter({
  getCluster: permissionRequiredProcedure
    .requiresPermission("admin")
    .concat(kubernetesMiddleware())
    .query(async (): Promise<KubernetesCluster> => {
      const { coreApi, metricsApi, versionApi, kubeConfig } = KubernetesClient.getInstance();

      try {
        const versionInfo = await versionApi.getCode();
        const nodes = await coreApi.listNode();
        const nodeMetricsClient = await metricsApi.getNodeMetrics();
        const listPodForAllNamespaces = await coreApi.listPodForAllNamespaces();

        let totalCPUCapacity = 0;
        let totalCPUAllocatable = 0;
        let totalCPUUsage = 0;

        let totalMemoryCapacity = 0;
        let totalMemoryAllocatable = 0;
        let totalMemoryUsage = 0;

        let totalCapacityPods = 0;
        const cpuResourceParser = new CpuResourceParser();
        const memoryResourceParser = new MemoryResourceParser();

        nodes.items.forEach((node) => {
          totalCapacityPods += Number(node.status?.capacity?.pods);

          const cpuCapacity = cpuResourceParser.parse(node.status?.capacity?.cpu ?? "0");
          const cpuAllocatable = cpuResourceParser.parse(node.status?.allocatable?.cpu ?? "0");
          totalCPUCapacity += cpuCapacity;
          totalCPUAllocatable += cpuAllocatable;

          const memoryCapacity = memoryResourceParser.parse(node.status?.capacity?.memory ?? "0");
          const memoryAllocatable = memoryResourceParser.parse(node.status?.allocatable?.memory ?? "0");
          totalMemoryCapacity += memoryCapacity;
          totalMemoryAllocatable += memoryAllocatable;

          const nodeName = node.metadata?.name;
          const nodeMetric = nodeMetricsClient.items.find((metric) => metric.metadata.name === nodeName);
          if (nodeMetric) {
            const cpuUsage = cpuResourceParser.parse(nodeMetric.usage.cpu);
            totalCPUUsage += cpuUsage;

            const memoryUsage = memoryResourceParser.parse(nodeMetric.usage.memory);
            totalMemoryUsage += memoryUsage;
          }
        });

        const reservedCPU = totalCPUCapacity - totalCPUAllocatable;
        const reservedMemory = totalMemoryCapacity - totalMemoryAllocatable;

        const reservedCPUPercentage = (reservedCPU / totalCPUCapacity) * 100;
        const reservedMemoryPercentage = (reservedMemory / totalMemoryCapacity) * 100;

        const usagePercentageAllocatable = (totalCPUUsage / totalCPUAllocatable) * 100;
        const usagePercentageMemoryAllocatable = (totalMemoryUsage / totalMemoryAllocatable) * 100;

        const usedPodsPercentage = (listPodForAllNamespaces.items.length / totalCapacityPods) * 100;

        return {
          name: kubeConfig.getCurrentContext(),
          providers: getProviders(versionInfo, nodes),
          kubernetesVersion: versionInfo.gitVersion,
          architecture: versionInfo.platform,
          nodeCount: nodes.items.length,
          capacity: [
            {
              type: "CPU",
              resourcesStats: [
                {
                  percentageValue: Number(reservedCPUPercentage.toFixed(2)),
                  type: "Reserved",
                  capacityUnit: "Cores",
                  usedValue: Number(reservedCPU.toFixed(2)),
                  maxUsedValue: Number(totalCPUCapacity.toFixed(2)),
                },
                {
                  percentageValue: Number(usagePercentageAllocatable.toFixed(2)),
                  type: "Used",
                  capacityUnit: "Cores",
                  usedValue: Number(totalCPUUsage.toFixed(2)),
                  maxUsedValue: Number(totalCPUAllocatable.toFixed(2)),
                },
              ],
            },
            {
              type: "Memory",
              resourcesStats: [
                {
                  percentageValue: Number(reservedMemoryPercentage.toFixed(2)),
                  type: "Reserved",
                  capacityUnit: "GiB",
                  usedValue: Number(reservedMemory.toFixed(2)),
                  maxUsedValue: Number(totalMemoryCapacity.toFixed(2)),
                },
                {
                  percentageValue: Number(usagePercentageMemoryAllocatable.toFixed(2)),
                  type: "Used",
                  capacityUnit: "GiB",
                  usedValue: Number(totalMemoryUsage.toFixed(2)),
                  maxUsedValue: Number(totalMemoryAllocatable.toFixed(2)),
                },
              ],
            },
            {
              type: "Pods",
              resourcesStats: [
                {
                  percentageValue: Number(usedPodsPercentage.toFixed(2)),
                  type: "Used",
                  usedValue: listPodForAllNamespaces.items.length,
                  maxUsedValue: totalCapacityPods,
                },
              ],
            },
          ],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes cluster",
          cause: error,
        });
      }
    }),
  getClusterResourceCounts: permissionRequiredProcedure
    .requiresPermission("admin")
    .query(async (): Promise<ClusterResourceCount[]> => {
      const { coreApi, networkingApi } = KubernetesClient.getInstance();

      try {
        const [pods, ingresses, services, configMaps, namespaces, nodes, secrets, volumes] = await Promise.all([
          coreApi.listPodForAllNamespaces(),
          networkingApi.listIngressForAllNamespaces(),
          coreApi.listServiceForAllNamespaces(),
          coreApi.listConfigMapForAllNamespaces(),
          coreApi.listNamespace(),
          coreApi.listNode(),
          coreApi.listSecretForAllNamespaces(),
          coreApi.listPersistentVolumeClaimForAllNamespaces(),
        ]);

        return [
          { label: "nodes", count: nodes.items.length },
          { label: "namespaces", count: namespaces.items.length },
          { label: "ingresses", count: ingresses.items.length },
          { label: "services", count: services.items.length },
          { label: "pods", count: pods.items.length },
          { label: "secrets", count: secrets.items.length },
          { label: "configmaps", count: configMaps.items.length },
          { label: "volumes", count: volumes.items.length },
        ];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching Kubernetes resources count",
          cause: error,
        });
      }
    }),
});

function getProviders(versionInfo: VersionInfo, nodes: V1NodeList) {
  const providers = new Set<string>();

  if (versionInfo.gitVersion.includes("k3s")) providers.add("k3s");
  if (versionInfo.gitVersion.includes("gke")) providers.add("GKE");
  if (versionInfo.gitVersion.includes("eks")) providers.add("EKS");
  if (versionInfo.gitVersion.includes("aks")) providers.add("AKS");

  nodes.items.forEach((node) => {
    const labels = node.metadata?.labels ?? {};
    const nodeProviderLabel = labels["node.kubernetes.io/instance-type"] ?? labels.provider ?? "";

    if (nodeProviderLabel.includes("aws")) providers.add("EKS");
    if (nodeProviderLabel.includes("azure")) providers.add("AKS");
    if (nodeProviderLabel.includes("gce")) providers.add("GKE");
    if (nodeProviderLabel.includes("k3s")) providers.add("k3s");

    const nodeInfo = node.status?.nodeInfo;
    if (nodeInfo) {
      const osImage = nodeInfo.osImage.toLowerCase();
      const kernelVersion = nodeInfo.kernelVersion.toLowerCase();

      if (osImage.includes("talos") || kernelVersion.includes("talos")) {
        providers.add("Talos");
      }
    }
  });

  return Array.from(providers).join(", ");
}
