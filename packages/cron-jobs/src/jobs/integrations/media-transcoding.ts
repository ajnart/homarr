import { EVERY_5_MINUTES } from "@homarr/cron-jobs-core/expressions";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";
import { mediaTranscodingRequestHandler } from "@homarr/request-handler/media-transcoding";

import { createCronJob } from "../../lib";

export const mediaTranscodingJob = createCronJob("mediaTranscoding", EVERY_5_MINUTES).withCallback(
  createRequestIntegrationJobHandler(mediaTranscodingRequestHandler.handler, {
    widgetKinds: ["mediaTranscoding"],
    getInput: {
      mediaTranscoding: () => ({ pageOffset: 0, pageSize: 10 }),
    },
  }),
);
