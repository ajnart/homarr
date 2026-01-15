import { z } from "zod/v4";

import { analyseOldmarrImportForRouterAsync, analyseOldmarrImportInputSchema } from "@homarr/old-import/analyse";
import {
  ensureValidTokenOrThrow,
  importInitialOldmarrAsync,
  importInitialOldmarrInputSchema,
} from "@homarr/old-import/import";

import { createTRPCRouter, onboardingProcedure } from "../../trpc";
import { nextOnboardingStepAsync } from "../onboard/onboard-queries";

export const importRouter = createTRPCRouter({
  analyseInitialOldmarrImport: onboardingProcedure
    .requiresStep("import")
    .input(analyseOldmarrImportInputSchema)
    .mutation(async ({ input }) => {
      return await analyseOldmarrImportForRouterAsync(input);
    }),
  validateToken: onboardingProcedure
    .requiresStep("import")
    .input(
      z.object({
        checksum: z.string(),
        token: z.string(),
      }),
    )
    .mutation(({ input }) => {
      try {
        ensureValidTokenOrThrow(input.checksum, input.token);
        return true;
      } catch {
        return false;
      }
    }),
  importInitialOldmarrImport: onboardingProcedure
    .requiresStep("import")
    .input(importInitialOldmarrInputSchema)
    .mutation(async ({ ctx, input }) => {
      await importInitialOldmarrAsync(ctx.db, input);
      await nextOnboardingStepAsync(ctx.db, undefined);
    }),
});
