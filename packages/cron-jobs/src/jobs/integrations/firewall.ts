import { EVERY_5_SECONDS, EVERY_30_SECONDS, EVERY_HOUR, EVERY_MINUTE } from "@homarr/cron-jobs-core/expressions";
import {
  firewallCpuRequestHandler,
  firewallInterfacesRequestHandler,
  firewallMemoryRequestHandler,
  firewallVersionRequestHandler,
} from "@homarr/request-handler/firewall";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";

import { createCronJob } from "../../lib";

export const firewallCpuJob = createCronJob("firewallCpu", EVERY_5_SECONDS).withCallback(
  createRequestIntegrationJobHandler(firewallCpuRequestHandler.handler, {
    widgetKinds: ["firewall"],
    getInput: {
      firewall: () => ({}),
    },
  }),
);

export const firewallMemoryJob = createCronJob("firewallMemory", EVERY_MINUTE).withCallback(
  createRequestIntegrationJobHandler(firewallMemoryRequestHandler.handler, {
    widgetKinds: ["firewall"],
    getInput: {
      firewall: () => ({}),
    },
  }),
);

export const firewallInterfacesJob = createCronJob("firewallInterfaces", EVERY_30_SECONDS).withCallback(
  createRequestIntegrationJobHandler(firewallInterfacesRequestHandler.handler, {
    widgetKinds: ["firewall"],
    getInput: {
      firewall: () => ({}),
    },
  }),
);

export const firewallVersionJob = createCronJob("firewallVersion", EVERY_HOUR).withCallback(
  createRequestIntegrationJobHandler(firewallVersionRequestHandler.handler, {
    widgetKinds: ["firewall"],
    getInput: {
      firewall: () => ({}),
    },
  }),
);
