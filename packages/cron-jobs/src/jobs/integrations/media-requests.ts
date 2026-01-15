import { EVERY_MINUTE } from "@homarr/cron-jobs-core/expressions";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";
import { mediaRequestListRequestHandler } from "@homarr/request-handler/media-request-list";
import { mediaRequestStatsRequestHandler } from "@homarr/request-handler/media-request-stats";

import { createCronJob } from "../../lib";

export const mediaRequestStatsJob = createCronJob("mediaRequestStats", EVERY_MINUTE).withCallback(
  createRequestIntegrationJobHandler(mediaRequestStatsRequestHandler.handler, {
    widgetKinds: ["mediaRequests-requestStats"],
    getInput: {
      "mediaRequests-requestStats": () => ({}),
    },
  }),
);

export const mediaRequestListJob = createCronJob("mediaRequestList", EVERY_MINUTE).withCallback(
  createRequestIntegrationJobHandler(mediaRequestListRequestHandler.handler, {
    widgetKinds: ["mediaRequests-requestList"],
    getInput: {
      "mediaRequests-requestList": () => ({}),
    },
  }),
);
