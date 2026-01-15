import { initTRPC, TRPCError } from "@trpc/server";
import { validate } from "node-cron";
import { z } from "zod/v4";

import type { JobGroupKeys } from "@homarr/cron-jobs";
import { jobGroup } from "@homarr/cron-jobs";

import { env } from "./env";

export const jobGroupKeys = jobGroup.getKeys();
export const jobNameSchema = z.enum(jobGroup.getKeys());

export interface IJobManager {
  startAsync(name: JobGroupKeys): Promise<void>;
  triggerAsync(name: JobGroupKeys): Promise<void>;
  stopAsync(name: JobGroupKeys): Promise<void>;
  updateIntervalAsync(name: JobGroupKeys, cron: string): Promise<void>;
  disableAsync(name: JobGroupKeys): Promise<void>;
  enableAsync(name: JobGroupKeys): Promise<void>;
  getAllAsync(): Promise<{ name: JobGroupKeys; cron: string; preventManualExecution: boolean; isEnabled: boolean }[]>;
}

const t = initTRPC
  .context<{
    manager: IJobManager;
    apiKey?: string;
  }>()
  .create();

const createTrpcRouter = t.router;
const apiKeyProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.apiKey !== env.CRON_JOB_API_KEY) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Missing or invalid API key",
    });
  }

  return next({
    ctx: {
      ...ctx,
      apiKey: undefined, // Clear the API key after checking
    },
  });
});

export const cronExpressionSchema = z.string().refine((expression) => validate(expression), {
  error: "Invalid cron expression",
});

export const jobRouter = createTrpcRouter({
  start: apiKeyProcedure.input(jobNameSchema).mutation(async ({ input, ctx }) => {
    await ctx.manager.startAsync(input);
  }),
  trigger: apiKeyProcedure.input(jobNameSchema).mutation(async ({ input, ctx }) => {
    await ctx.manager.triggerAsync(input);
  }),
  stop: apiKeyProcedure.input(jobNameSchema).mutation(async ({ input, ctx }) => {
    await ctx.manager.stopAsync(input);
  }),
  updateInterval: apiKeyProcedure
    .input(
      z.object({
        name: jobNameSchema,
        cron: cronExpressionSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.manager.updateIntervalAsync(input.name, input.cron);
    }),
  disable: apiKeyProcedure.input(jobNameSchema).mutation(async ({ input, ctx }) => {
    await ctx.manager.disableAsync(input);
  }),
  enable: apiKeyProcedure.input(jobNameSchema).mutation(async ({ input, ctx }) => {
    await ctx.manager.enableAsync(input);
  }),
  getAll: apiKeyProcedure.query(({ ctx }) => {
    return ctx.manager.getAllAsync();
  }),
});

export type JobRouter = typeof jobRouter;
