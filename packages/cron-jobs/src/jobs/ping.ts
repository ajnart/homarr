import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { EVERY_MINUTE } from "@homarr/cron-jobs-core/expressions";
import { db } from "@homarr/db";
import { getServerSettingByKeyAsync } from "@homarr/db/queries";
import { sendPingRequestAsync } from "@homarr/ping";
import { pingChannel, pingUrlChannel } from "@homarr/redis";

import { createCronJob } from "../lib";

const logger = createLogger({ module: "pingJobs" });

const resetPreviousUrlsAsync = async () => {
  await pingUrlChannel.clearAsync();
  logger.info("Cleared previous ping urls");
};

export const pingJob = createCronJob("ping", EVERY_MINUTE, {
  beforeStart: resetPreviousUrlsAsync,
}).withCallback(async () => {
  const boardSettings = await getServerSettingByKeyAsync(db, "board");

  if (boardSettings.forceDisableStatus) {
    logger.debug("Simple ping is disabled by server settings");
    return;
  }

  const urls = await pingUrlChannel.getAllAsync();

  await Promise.allSettled([...new Set(urls)].map(pingAsync));
});

const pingAsync = async (url: string) => {
  const pingResult = await sendPingRequestAsync(url);

  if ("statusCode" in pingResult) {
    logger.debug("Executed ping successfully", { url, statusCode: pingResult.statusCode });
  } else {
    logger.error(new ErrorWithMetadata("Executing ping failed", { url }, { cause: pingResult.error }));
  }

  await pingChannel.publishAsync({
    url,
    ...pingResult,
  });
};
