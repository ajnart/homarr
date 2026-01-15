import { EVERY_5_SECONDS } from "@homarr/cron-jobs-core/expressions";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";
import { mediaServerRequestHandler } from "@homarr/request-handler/media-server";

import { createCronJob } from "../../lib";

export const mediaServerJob = createCronJob("mediaServer", EVERY_5_SECONDS).withCallback(
  createRequestIntegrationJobHandler(mediaServerRequestHandler.handler, {
    widgetKinds: ["mediaServer"],
    getInput: {
      mediaServer: ({ showOnlyPlaying }) => ({ showOnlyPlaying }),
    },
  }),
);
