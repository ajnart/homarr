import type { ScheduledTask } from "node-cron";

import { objectEntries, objectKeys } from "@homarr/common";
import { db } from "@homarr/db";

import type { JobCallback } from "./creator";
import type { Logger } from "./logger";
import { jobRegistry } from "./registry";

type Jobs<TAllowedNames extends string> = {
  [name in TAllowedNames]: ReturnType<JobCallback<TAllowedNames, name>>;
};

export interface CreateCronJobGroupCreatorOptions {
  logger: Logger;
}

export const createJobGroupCreator = <TAllowedNames extends string = string>(
  options: CreateCronJobGroupCreatorOptions,
) => {
  return <TJobs extends Jobs<TAllowedNames>>(jobs: TJobs) => {
    options.logger.logDebug("Creating job group.", {
      jobCount: Object.keys(jobs).length,
    });
    for (const [key, job] of objectEntries(jobs)) {
      if (typeof key !== "string" || typeof job.name !== "string") continue;

      options.logger.logDebug("Registering job in the job registry.", {
        name: job.name,
      });
      jobRegistry.set(key, {
        ...job,
        name: job.name,
      });
    }

    const tasks = new Map<string, ScheduledTask>();

    return {
      initializeAsync: async () => {
        const configurations = await db.query.cronJobConfigurations.findMany();
        for (const job of jobRegistry.values()) {
          const configuration = configurations.find(({ name }) => name === job.name);
          if (configuration?.isEnabled === false) {
            continue;
          }
          if (tasks.has(job.name)) {
            continue;
          }

          const scheduledTask = await job.createTaskAsync();

          tasks.set(job.name, scheduledTask);
        }
      },
      startAsync: async (name: keyof TJobs) => {
        const job = jobRegistry.get(name as string);
        if (!job) return;
        if (!tasks.has(job.name)) return;

        options.logger.logInfo("Starting schedule of cron job.", {
          name: job.name,
        });
        await job.onStartAsync();
        await tasks.get(name as string)?.start();
      },
      startAllAsync: async () => {
        for (const job of jobRegistry.values()) {
          if (!tasks.has(job.name)) {
            continue;
          }

          options.logger.logInfo("Starting schedule of cron job.", {
            name: job.name,
          });
          await job.onStartAsync();
          await tasks.get(job.name)?.start();
        }
      },
      runManuallyAsync: async (name: keyof TJobs) => {
        const job = jobRegistry.get(name as string);
        if (!job) return;
        if (job.preventManualExecution) {
          throw new Error(`The job "${job.name}" can not be executed manually.`);
        }

        options.logger.logInfo("Running schedule cron job manually.", {
          name: job.name,
        });
        await tasks.get(name as string)?.execute();
      },
      stopAsync: async (name: keyof TJobs) => {
        const job = jobRegistry.get(name as string);
        if (!job) return;

        options.logger.logInfo("Stopping schedule of cron job.", {
          name: job.name,
        });
        await tasks.get(name as string)?.stop();
      },
      stopAllAsync: async () => {
        for (const job of jobRegistry.values()) {
          options.logger.logInfo("Stopping schedule of cron job.", {
            name: job.name,
          });
          await tasks.get(job.name)?.stop();
        }
      },
      getJobRegistry() {
        return jobRegistry as Map<TAllowedNames, ReturnType<JobCallback<TAllowedNames, TAllowedNames>>>;
      },
      getTask(name: keyof TJobs) {
        return tasks.get(name as string) ?? null;
      },
      setTask(name: keyof TJobs, task: ScheduledTask) {
        tasks.set(name as string, task);
      },
      getKeys() {
        return objectKeys(jobs);
      },
    };
  };
};
