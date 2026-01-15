import { z } from "zod/v4";

import { onboarding } from "@homarr/db/schema";
import { onboardingSteps } from "@homarr/definitions";
import { zodEnumFromArray } from "@homarr/validation/enums";

import { createTRPCRouter, publicProcedure } from "../../trpc";
import { getOnboardingOrFallbackAsync, nextOnboardingStepAsync } from "./onboard-queries";

export const onboardRouter = createTRPCRouter({
  currentStep: publicProcedure.query(async ({ ctx }) => {
    return await getOnboardingOrFallbackAsync(ctx.db);
  }),
  nextStep: publicProcedure
    .input(
      z.object({
        // Preferred step is only needed for 'preferred' conditions
        preferredStep: zodEnumFromArray(onboardingSteps).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await nextOnboardingStepAsync(ctx.db, input.preferredStep);
    }),
  previousStep: publicProcedure.mutation(async ({ ctx }) => {
    const { previous } = await getOnboardingOrFallbackAsync(ctx.db);

    if (previous !== "start") {
      return;
    }

    await ctx.db.update(onboarding).set({
      previousStep: null,
      step: "start",
    });
  }),
});
