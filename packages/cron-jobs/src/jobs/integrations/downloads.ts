import { EVERY_5_SECONDS } from "@homarr/cron-jobs-core/expressions";
import { downloadClientRequestHandler } from "@homarr/request-handler/downloads";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";

import { createCronJob } from "../../lib";

export const downloadsJob = createCronJob("downloads", EVERY_5_SECONDS).withCallback(
  createRequestIntegrationJobHandler(downloadClientRequestHandler.handler, {
    widgetKinds: ["downloads"],
    getInput: {
      downloads: (options) => ({
        limit: options.limitPerIntegration,
      }),
    },
  }),
);
