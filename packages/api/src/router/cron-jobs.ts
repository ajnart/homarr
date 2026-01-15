import { observable } from "@trpc/server/observable";
import z from "zod/v4";

import { createLogger } from "@homarr/core/infrastructure/logs";
import { cronExpressionSchema, jobGroupKeys, jobNameSchema } from "@homarr/cron-job-api";
import { cronJobApi } from "@homarr/cron-job-api/client";
import type { TaskStatus } from "@homarr/cron-job-status";
import { createCronJobStatusChannel } from "@homarr/cron-job-status";

import { createTRPCRouter, permissionRequiredProcedure } from "../trpc";

const logger = createLogger({ module: "cronJobsRouter" });

export const cronJobsRouter = createTRPCRouter({
  triggerJob: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(jobNameSchema)
    .mutation(async ({ input }) => {
      await cronJobApi.trigger.mutate(input);
    }),
  startJob: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(jobNameSchema)
    .mutation(async ({ input }) => {
      await cronJobApi.start.mutate(input);
    }),
  stopJob: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(jobNameSchema)
    .mutation(async ({ input }) => {
      await cronJobApi.stop.mutate(input);
    }),
  updateJobInterval: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(
      z.object({
        name: jobNameSchema,
        cron: cronExpressionSchema,
      }),
    )
    .mutation(async ({ input }) => {
      await cronJobApi.updateInterval.mutate(input);
    }),
  disableJob: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(jobNameSchema)
    .mutation(async ({ input }) => {
      await cronJobApi.disable.mutate(input);
    }),
  enableJob: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(jobNameSchema)
    .mutation(async ({ input }) => {
      await cronJobApi.enable.mutate(input);
    }),
  getJobs: permissionRequiredProcedure.requiresPermission("admin").query(async () => {
    return await cronJobApi.getAll.query();
  }),
  subscribeToStatusUpdates: permissionRequiredProcedure.requiresPermission("admin").subscription(() => {
    return observable<TaskStatus>((emit) => {
      const unsubscribes: (() => void)[] = [];

      for (const name of jobGroupKeys) {
        const channel = createCronJobStatusChannel(name);
        const unsubscribe = channel.subscribe((data) => {
          emit.next(data);
        });
        unsubscribes.push(unsubscribe);
      }

      logger.info("A tRPC client has connected to the cron job status updates procedure");

      return () => {
        unsubscribes.forEach((unsubscribe) => {
          unsubscribe();
        });
      };
    });
  }),
});
