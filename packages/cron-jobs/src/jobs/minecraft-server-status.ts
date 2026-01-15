import SuperJSON from "superjson";

import { EVERY_5_MINUTES } from "@homarr/cron-jobs-core/expressions";
import { db, eq } from "@homarr/db";
import { items } from "@homarr/db/schema";
import { minecraftServerStatusRequestHandler } from "@homarr/request-handler/minecraft-server-status";

import type { WidgetComponentProps } from "../../../widgets/src";
import { createCronJob } from "../lib";

export const minecraftServerStatusJob = createCronJob("minecraftServerStatus", EVERY_5_MINUTES).withCallback(
  async () => {
    const dbItems = await db.query.items.findMany({
      where: eq(items.kind, "minecraftServerStatus"),
    });

    await Promise.allSettled(
      dbItems.map(async (item) => {
        const options = SuperJSON.parse<WidgetComponentProps<"minecraftServerStatus">["options"]>(item.options);
        const innerHandler = minecraftServerStatusRequestHandler.handler(options);
        await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: true });
      }),
    );
  },
);
