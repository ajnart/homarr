import SuperJSON from "superjson";

import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { EVERY_MINUTE } from "@homarr/cron-jobs-core/expressions";
import { db, eq } from "@homarr/db";
import { items } from "@homarr/db/schema";
import { dockerContainersRequestHandler } from "@homarr/request-handler/docker";

import type { WidgetComponentProps } from "../../../widgets";
import { createCronJob } from "../lib";

const logger = createLogger({ module: "dockerJobs" });

export const dockerContainersJob = createCronJob("dockerContainers", EVERY_MINUTE).withCallback(async () => {
  const dockerItems = await db.query.items.findMany({
    where: eq(items.kind, "dockerContainers"),
  });

  await Promise.allSettled(
    dockerItems.map(async (item) => {
      try {
        const options = SuperJSON.parse<WidgetComponentProps<"dockerContainers">["options"]>(item.options);
        const innerHandler = dockerContainersRequestHandler.handler(options);
        await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: true });
      } catch (error) {
        logger.error(new ErrorWithMetadata("Failed to update Docker container status", { item }, { cause: error }));
      }
    }),
  );
});
