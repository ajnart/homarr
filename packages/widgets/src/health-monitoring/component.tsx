"use client";

import { ScrollArea, Tabs } from "@mantine/core";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { clientApi } from "@homarr/api/client";
import type { IntegrationKind } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../definition";
import { ClusterHealthMonitoring } from "./cluster/cluster-health";
import { SystemHealthMonitoring } from "./system-health";

dayjs.extend(duration);

const isClusterIntegration = (integration: { kind: IntegrationKind }) =>
  integration.kind === "proxmox" || integration.kind === "mock";

export default function HealthMonitoringWidget(props: WidgetComponentProps<"healthMonitoring">) {
  const [integrations] = clientApi.integration.byIds.useSuspenseQuery(props.integrationIds);
  const t = useI18n();

  const clusterIntegrationId = integrations.find(isClusterIntegration)?.id;

  if (!clusterIntegrationId) {
    return <SystemHealthMonitoring {...props} />;
  }

  const otherIntegrationIds = integrations
    // We want to have the mock integration also in the system tab, so we use it for both
    .filter((integration) => integration.kind !== "proxmox")
    .map((integration) => integration.id);
  if (otherIntegrationIds.length === 0) {
    return <ClusterHealthMonitoring {...props} integrationId={clusterIntegrationId} />;
  }

  return (
    <ScrollArea h="100%">
      <Tabs defaultValue={props.options.defaultTab} variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="system" fz="xs">
            <b>{t("widget.healthMonitoring.tab.system")}</b>
          </Tabs.Tab>
          <Tabs.Tab value="cluster" fz="xs">
            <b>{t("widget.healthMonitoring.tab.cluster")}</b>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="system">
          <SystemHealthMonitoring {...props} integrationIds={otherIntegrationIds} />
        </Tabs.Panel>
        <Tabs.Panel value="cluster">
          <ClusterHealthMonitoring integrationId={clusterIntegrationId} {...props} />
        </Tabs.Panel>
      </Tabs>
    </ScrollArea>
  );
}
