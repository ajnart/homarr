import { EVERY_HOUR } from "@homarr/cron-jobs-core/expressions";
import { updateCheckerRequestHandler } from "@homarr/request-handler/update-checker";

import { createCronJob } from "../lib";

export const updateCheckerJob = createCronJob("updateChecker", EVERY_HOUR, {
  runOnStart: true,
}).withCallback(async () => {
  const handler = updateCheckerRequestHandler.handler({});
  await handler.getCachedOrUpdatedDataAsync({
    forceUpdate: true,
  });
});
