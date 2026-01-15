import { createLogger } from "@homarr/core/infrastructure/logs";
import { updateCheckerRequestHandler } from "@homarr/request-handler/update-checker";

import { createTRPCRouter, permissionRequiredProcedure } from "../trpc";

const logger = createLogger({ module: "updateCheckerRouter" });

export const updateCheckerRouter = createTRPCRouter({
  getAvailableUpdates: permissionRequiredProcedure.requiresPermission("admin").query(async () => {
    try {
      const handler = updateCheckerRequestHandler.handler({});
      const data = await handler.getCachedOrUpdatedDataAsync({});
      return data.data.availableUpdates;
    } catch (error) {
      logger.error(new Error("Failed to get available updates", { cause: error }));
      return undefined; // We return undefined to not show the indicator in the UI
    }
  }),
});
