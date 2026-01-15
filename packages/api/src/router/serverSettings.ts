import { z } from "zod/v4";

import { getServerSettingByKeyAsync, getServerSettingsAsync, updateServerSettingByKeyAsync } from "@homarr/db/queries";
import type { ServerSettings } from "@homarr/server-settings";
import { defaultServerSettingsKeys } from "@homarr/server-settings";
import { settingsInitSchema } from "@homarr/validation/settings";

import { createTRPCRouter, onboardingProcedure, permissionRequiredProcedure, publicProcedure } from "../trpc";
import { nextOnboardingStepAsync } from "./onboard/onboard-queries";

export const serverSettingsRouter = createTRPCRouter({
  getCulture: publicProcedure.query(async ({ ctx }) => {
    return await getServerSettingByKeyAsync(ctx.db, "culture");
  }),
  getAll: permissionRequiredProcedure.requiresPermission("admin").query(async ({ ctx }) => {
    return await getServerSettingsAsync(ctx.db);
  }),
  saveSettings: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(
      z.object({
        settingsKey: z.enum(defaultServerSettingsKeys),
        value: z.record(z.string(), z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await updateServerSettingByKeyAsync(
        ctx.db,
        input.settingsKey,
        input.value as ServerSettings[keyof ServerSettings],
      );
    }),
  initSettings: onboardingProcedure
    .requiresStep("settings")
    .input(settingsInitSchema)
    .mutation(async ({ ctx, input }) => {
      await updateServerSettingByKeyAsync(ctx.db, "analytics", input.analytics);
      await updateServerSettingByKeyAsync(ctx.db, "crawlingAndIndexing", input.crawlingAndIndexing);
      await nextOnboardingStepAsync(ctx.db, undefined);
    }),
});
