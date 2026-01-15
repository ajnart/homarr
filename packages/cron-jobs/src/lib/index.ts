import { createLogger } from "@homarr/core/infrastructure/logs";
import { beforeCallbackAsync, onCallbackErrorAsync, onCallbackSuccessAsync } from "@homarr/cron-job-status/publisher";
import { createCronJobFunctions } from "@homarr/cron-jobs-core";
import type { Logger } from "@homarr/cron-jobs-core/logger";
import type { TranslationObject } from "@homarr/translation";

const logger = createLogger({ module: "cronJobs" });

class WinstonCronJobLogger implements Logger {
  logDebug(message: string, metadata?: Record<string, unknown>): void {
    logger.debug(message, metadata);
  }
  logInfo(message: string, metadata?: Record<string, unknown>): void {
    logger.info(message, metadata);
  }
  logError(message: string, metadata?: Record<string, unknown>): void;
  logError(error: unknown): void;
  logError(messageOrError: unknown, metadata?: Record<string, unknown>): void {
    if (typeof messageOrError === "string") {
      logger.error(messageOrError, metadata);
      return;
    }
    logger.error(messageOrError);
  }
  logWarning(message: string, metadata?: Record<string, unknown>): void {
    logger.warn(message, metadata);
  }
}

export const { createCronJob, createCronJobGroup } = createCronJobFunctions<
  keyof TranslationObject["management"]["page"]["tool"]["tasks"]["job"]
>({
  logger: new WinstonCronJobLogger(),
  beforeCallback: beforeCallbackAsync,
  onCallbackSuccess: onCallbackSuccessAsync,
  onCallbackError: onCallbackErrorAsync,
});
