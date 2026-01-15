import { EVERY_5_SECONDS } from "@homarr/cron-jobs-core/expressions";
import { clusterInfoRequestHandler, systemInfoRequestHandler } from "@homarr/request-handler/health-monitoring";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";

import { createCronJob } from "../../lib";

export const healthMonitoringJob = createCronJob("healthMonitoring", EVERY_5_SECONDS).withCallback(
  createRequestIntegrationJobHandler(
    (integration, itemOptions: Record<string, never>) => {
      const { kind } = integration;

      if (kind !== "proxmox" && kind !== "mock") {
        return systemInfoRequestHandler.handler({ ...integration, kind }, itemOptions);
      }
      return clusterInfoRequestHandler.handler({ ...integration, kind }, itemOptions);
    },
    {
      widgetKinds: ["healthMonitoring", "systemResources"],
      getInput: {
        healthMonitoring: () => ({}),
        systemResources: () => ({}),
      },
    },
  ),
);
