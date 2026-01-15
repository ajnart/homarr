import { EVERY_5_MINUTES } from "@homarr/cron-jobs-core/expressions";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";
import { notificationsRequestHandler } from "@homarr/request-handler/notifications";

import { createCronJob } from "../../lib";

export const refreshNotificationsJob = createCronJob("refreshNotifications", EVERY_5_MINUTES).withCallback(
  createRequestIntegrationJobHandler(notificationsRequestHandler.handler, {
    widgetKinds: ["notifications"],
    getInput: {
      notifications: (options) => options,
    },
  }),
);
