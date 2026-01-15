import { createLogger } from "@homarr/core/infrastructure/logs";
import { updateCheckerRequestHandler } from "@homarr/request-handler/update-checker";

const logger = createLogger({ module: "invalidateUpdateCheckerCache" });

/**
 * Invalidates the update checker cache on startup to ensure fresh data.
 * It is important as we want to avoid showing pending updates after the update to latest version.
 */
export async function invalidateUpdateCheckerCacheAsync() {
  try {
    const handler = updateCheckerRequestHandler.handler({});
    await handler.invalidateAsync();
    logger.debug("Update checker cache invalidated");
  } catch (error) {
    logger.error(new Error("Failed to invalidate update checker cache", { cause: error }));
  }
}
