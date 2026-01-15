import SuperJSON from "superjson";

import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { EVERY_10_MINUTES } from "@homarr/cron-jobs-core/expressions";
import { db, eq } from "@homarr/db";
import { items } from "@homarr/db/schema";
// This import is done that way to avoid circular dependencies.
import { rssFeedsRequestHandler } from "@homarr/request-handler/rss-feeds";

import type { WidgetComponentProps } from "../../../widgets";
import { createCronJob } from "../lib";

const logger = createLogger({ module: "rssFeedsJobs" });

export const rssFeedsJob = createCronJob("rssFeeds", EVERY_10_MINUTES).withCallback(async () => {
  const rssItems = await db.query.items.findMany({
    where: eq(items.kind, "rssFeed"),
  });

  const itemOptions = rssItems.map((item) => SuperJSON.parse<WidgetComponentProps<"rssFeed">["options"]>(item.options));

  for (const option of itemOptions) {
    const maxAmountPosts = typeof option.maximumAmountPosts === "number" ? option.maximumAmountPosts : 100;
    for (const url of option.feedUrls) {
      try {
        const innerHandler = rssFeedsRequestHandler.handler({
          url,
          count: maxAmountPosts,
        });
        await innerHandler.getCachedOrUpdatedDataAsync({
          forceUpdate: true,
        });
      } catch (error) {
        logger.error(new ErrorWithMetadata("Failed to update RSS feed", { url }, { cause: error }));
      }
    }
  }
});
