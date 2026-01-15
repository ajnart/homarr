"use client";

import { SimpleGrid, Skeleton, Stack, Title } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { createId } from "@homarr/common";
import type { KubernetesLabelResourceType } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";

import KubernetesErrorPage from "~/app/[locale]/manage/tools/kubernetes/cluster-dashboard/error";
import { HeaderCard } from "~/app/[locale]/manage/tools/kubernetes/cluster-dashboard/header-card/header-card";
import { ResourceGauge } from "~/app/[locale]/manage/tools/kubernetes/cluster-dashboard/resource-gauge/resource-gauge";
import { ResourceTile } from "~/app/[locale]/manage/tools/kubernetes/cluster-dashboard/resource-tile/resource-tile";

export function ClusterDashboard() {
  const t = useI18n();

  const {
    data: clusterData,
    isLoading: isClusterLoading,
    isError: isClusterError,
  } = clientApi.kubernetes.cluster.getCluster.useQuery();

  const {
    data: resourceCountsData,
    isLoading: isResourceCountsLoading,
    isError: isResourceCountsError,
  } = clientApi.kubernetes.cluster.getClusterResourceCounts.useQuery();

  return (
    <Stack bg="var(--mantine-color-body)">
      <Title>{t("kubernetes.cluster.title")}</Title>
      <SimpleGrid cols={{ xs: 1, sm: 2, md: 3 }}>
        {isClusterError ? (
          Array.from({ length: 3 }).map(() => <KubernetesErrorPage key={createId()} />)
        ) : isClusterLoading ? (
          Array.from({ length: 3 }).map(() => <Skeleton key={createId()} height={65} />)
        ) : (
          <>
            <HeaderCard headerType={"providers"} value={clusterData ? clusterData.providers : ""} />
            <HeaderCard headerType={"version"} value={clusterData ? clusterData.kubernetesVersion : ""} />
            <HeaderCard headerType={"architecture"} value={clusterData ? clusterData.architecture : ""} />
          </>
        )}
      </SimpleGrid>

      <Title>{t("kubernetes.cluster.capacity.title")}</Title>

      <SimpleGrid cols={{ xs: 1, sm: 2, md: 3 }}>
        {isClusterError
          ? Array.from({ length: 3 }).map(() => <KubernetesErrorPage key={createId()} />)
          : isClusterLoading
            ? Array.from({ length: 3 }).map(() => <Skeleton key={createId()} height={200} />)
            : clusterData?.capacity.map((capacity) => (
                <ResourceGauge kubernetesCapacity={capacity} key={capacity.type} />
              ))}
      </SimpleGrid>

      <Title>{t("kubernetes.cluster.resources.title")}</Title>

      <SimpleGrid cols={{ xs: 1, sm: 2, md: 3 }}>
        {isResourceCountsError
          ? Array.from({ length: 8 }).map(() => <KubernetesErrorPage key={createId()} />)
          : isResourceCountsLoading
            ? Array.from({ length: 8 }).map(() => <Skeleton key={createId()} height={100} />)
            : resourceCountsData?.map((clusterResourceCount) => (
                <ResourceTile
                  count={clusterResourceCount.count}
                  label={clusterResourceCount.label as KubernetesLabelResourceType}
                  key={clusterResourceCount.label}
                />
              ))}
      </SimpleGrid>
    </Stack>
  );
}
