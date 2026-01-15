import { trpc } from "@homarr/api/server";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { db, inArray } from "@homarr/db";
import { apps } from "@homarr/db/schema";

import type { Prefetch } from "../definition";

const logger = createLogger({ module: "appWidgetPrefetch" });

const prefetchAllAsync: Prefetch<"app"> = async (queryClient, items) => {
  const appIds = items.map((item) => item.options.appId);
  const distinctAppIds = [...new Set(appIds)];

  const dbApps = await db.query.apps.findMany({
    where: inArray(apps.id, distinctAppIds),
  });

  for (const app of dbApps) {
    queryClient.setQueryData(trpc.app.byId.queryKey({ id: app.id }), app);
  }

  logger.info("Successfully prefetched apps for app widget", { count: dbApps.length });
};

export default prefetchAllAsync;
