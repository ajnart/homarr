import { EVERY_MINUTE } from "@homarr/cron-jobs-core/expressions";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";
import { networkControllerRequestHandler } from "@homarr/request-handler/network-controller";

import { createCronJob } from "../../lib";

export const networkControllerJob = createCronJob("networkController", EVERY_MINUTE).withCallback(
  createRequestIntegrationJobHandler(networkControllerRequestHandler.handler, {
    widgetKinds: ["networkControllerSummary"],
    getInput: {
      networkControllerSummary: () => ({}),
    },
  }),
);
