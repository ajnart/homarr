import SuperJSON from "superjson";

import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { EVERY_10_MINUTES } from "@homarr/cron-jobs-core/expressions";
import { db, eq } from "@homarr/db";
import { items } from "@homarr/db/schema";
import { weatherRequestHandler } from "@homarr/request-handler/weather";

import type { WidgetComponentProps } from "../../../widgets";
import { createCronJob } from "../lib";

const logger = createLogger({ module: "weatherJobs" });

export const weatherJob = createCronJob("weather", EVERY_10_MINUTES).withCallback(async () => {
  const weatherItems = await db.query.items.findMany({
    where: eq(items.kind, "weather"),
  });

  const parsedItems = weatherItems.map((item) => ({
    id: item.id,
    options: SuperJSON.parse<WidgetComponentProps<"weather">["options"]>(item.options),
  }));

  for (const item of parsedItems) {
    try {
      const innerHandler = weatherRequestHandler.handler({
        longitude: item.options.location.longitude,
        latitude: item.options.location.latitude,
      });
      await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: true });
    } catch (error) {
      logger.error(new ErrorWithMetadata("Failed to update weather", { id: item.id }, { cause: error }));
    }
  }
});
