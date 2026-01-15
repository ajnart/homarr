import { createTask, validate } from "node-cron";

import { Stopwatch } from "@homarr/common";
import type { MaybePromise } from "@homarr/common/types";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { db } from "@homarr/db";

import type { Logger } from "./logger";
import type { ValidateCron } from "./validation";

export interface CreateCronJobCreatorOptions<TAllowedNames extends string> {
  beforeCallback?: (name: TAllowedNames) => MaybePromise<void>;
  onCallbackSuccess?: (name: TAllowedNames) => MaybePromise<void>;
  onCallbackError?: (name: TAllowedNames, error: unknown) => MaybePromise<void>;
  timezone?: string;
  logger: Logger;
}

interface CreateCronJobOptions {
  runOnStart?: boolean;
  preventManualExecution?: boolean;
  expectedMaximumDurationInMillis?: number;
  beforeStart?: () => MaybePromise<void>;
}

const createCallback = <TAllowedNames extends string, TName extends TAllowedNames>(
  name: TName,
  defaultCronExpression: string,
  options: CreateCronJobOptions,
  creatorOptions: CreateCronJobCreatorOptions<TAllowedNames>,
) => {
  const expectedMaximumDurationInMillis = options.expectedMaximumDurationInMillis ?? 2500;
  return (callback: () => MaybePromise<void>) => {
    const catchingCallbackAsync = async () => {
      try {
        creatorOptions.logger.logDebug("The callback of cron job started", {
          name,
        });
        const stopwatch = new Stopwatch();
        await creatorOptions.beforeCallback?.(name);
        const beforeCallbackTook = stopwatch.getElapsedInHumanWords();
        await callback();
        const callbackTook = stopwatch.getElapsedInHumanWords();
        creatorOptions.logger.logDebug("The callback of cron job succeeded", {
          name,
          beforeCallbackTook,
          callbackTook,
        });

        const durationInMillis = stopwatch.getElapsedInMilliseconds();
        if (durationInMillis > expectedMaximumDurationInMillis) {
          creatorOptions.logger.logWarning("The callback of cron job took longer than expected", {
            name,
            durationInMillis,
            expectedMaximumDurationInMillis,
          });
        }
        await creatorOptions.onCallbackSuccess?.(name);
      } catch (error) {
        creatorOptions.logger.logError(
          new ErrorWithMetadata(
            "The callback of cron job failed",
            {
              name,
            },
            { cause: error },
          ),
        );
        await creatorOptions.onCallbackError?.(name, error);
      }
    };

    return {
      name,
      cronExpression: defaultCronExpression,
      async createTaskAsync() {
        const configuration = await db.query.cronJobConfigurations.findFirst({
          where: (cronJobConfigurations, { eq }) => eq(cronJobConfigurations.name, name),
        });

        const scheduledTask = createTask(
          configuration?.cronExpression ?? defaultCronExpression,
          () => void catchingCallbackAsync(),
          {
            name,
            timezone: creatorOptions.timezone,
          },
        );
        creatorOptions.logger.logDebug("The scheduled task for cron job was created", {
          name,
          cronExpression: defaultCronExpression,
          timezone: creatorOptions.timezone,
          runOnStart: options.runOnStart,
        });

        return scheduledTask;
      },
      async onStartAsync() {
        if (options.beforeStart) {
          creatorOptions.logger.logDebug("Running beforeStart for job", {
            name,
          });
          await options.beforeStart();
        }

        if (!options.runOnStart) return;

        creatorOptions.logger.logDebug("The cron job is configured to run on start, executing callback", {
          name,
        });
        await catchingCallbackAsync();
      },
      async executeAsync() {
        await catchingCallbackAsync();
      },
      preventManualExecution: options.preventManualExecution ?? false,
    };
  };
};

export type JobCallback<TAllowedNames extends string, TName extends TAllowedNames> = ReturnType<
  typeof createCallback<TAllowedNames, TName>
>;

export const createCronJobCreator = <TAllowedNames extends string = string>(
  creatorOptions: CreateCronJobCreatorOptions<TAllowedNames>,
) => {
  return <TName extends TAllowedNames, TExpression extends string>(
    name: TName,
    defaultCronExpression: TExpression,
    options: CreateCronJobOptions = { runOnStart: false },
  ) => {
    creatorOptions.logger.logDebug("Validating cron expression for cron job", {
      name,
      cronExpression: defaultCronExpression,
    });
    if (!validate(defaultCronExpression)) {
      throw new Error(`Invalid cron expression '${defaultCronExpression}' for job '${name}'`);
    }
    creatorOptions.logger.logDebug("Cron job expression for cron job is valid", {
      name,
      cronExpression: defaultCronExpression,
    });

    const returnValue = {
      withCallback: createCallback<TAllowedNames, TName>(name, defaultCronExpression, options, creatorOptions),
    };

    // This is a type guard to check if the cron expression is valid and give the user a type hint
    return returnValue as unknown as ValidateCron<TExpression> extends true
      ? typeof returnValue
      : "Invalid cron expression";
  };
};
