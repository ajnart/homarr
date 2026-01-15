import { isProviderEnabled } from "@homarr/auth/server";
import { objectEntries } from "@homarr/common";
import type { MaybePromise } from "@homarr/common/types";
import type { Database } from "@homarr/db";
import { eq } from "@homarr/db";
import { groups, onboarding } from "@homarr/db/schema";
import type { OnboardingStep } from "@homarr/definitions";
import { credentialsAdminGroup } from "@homarr/definitions";

export const nextOnboardingStepAsync = async (db: Database, preferredStep: OnboardingStep | undefined) => {
  const { current } = await getOnboardingOrFallbackAsync(db);
  const nextStepConfiguration = nextSteps[current];
  if (!nextStepConfiguration) return;

  for (const conditionalStep of objectEntries(nextStepConfiguration)) {
    if (!conditionalStep) continue;
    const [nextStep, condition] = conditionalStep;
    if (condition === "preferred" && nextStep !== preferredStep) continue;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof condition === "boolean" && !condition) continue;
    if (typeof condition === "function" && !(await condition(db))) continue;

    await db.update(onboarding).set({
      previousStep: current,
      step: nextStep,
    });
    return;
  }
};

export const getOnboardingOrFallbackAsync = async (db: Database) => {
  const value = await db.query.onboarding.findFirst();
  if (!value) return { current: "start" as const, previous: null };

  return { current: value.step, previous: value.previousStep };
};

type NextStepCondition = true | "preferred" | ((db: Database) => MaybePromise<boolean>);

/**
 * The below object is a definition of which can be the next step of the current one.
 * If the value is `true`, it means the step can always be the next one.
 * If the value is `preferred`, it means that the step can only be reached if the input `preferredStep` is set to the step.
 * If the value is a function, it will be called with the database instance and should return a boolean.
 * If the value or result is `false`, the step has to be skipped and the next value or callback should be checked.
 */
const nextSteps: Partial<Record<OnboardingStep, Partial<Record<OnboardingStep, NextStepCondition>>>> = {
  start: {
    import: "preferred" as const,
    user: () => isProviderEnabled("credentials"),
    group: () => isProviderEnabled("ldap") || isProviderEnabled("oidc"),
    settings: true,
  },
  import: {
    // eslint-disable-next-line no-restricted-syntax
    user: async (db: Database) => {
      if (!isProviderEnabled("credentials")) return false;

      const adminGroup = await db.query.groups.findFirst({
        where: eq(groups.name, credentialsAdminGroup),
        with: {
          members: true,
        },
      });

      return !adminGroup || adminGroup.members.length === 0;
    },
    group: () => isProviderEnabled("ldap") || isProviderEnabled("oidc"),
    settings: true,
  },
  user: {
    group: () => isProviderEnabled("ldap") || isProviderEnabled("oidc"),
    settings: true,
  },
  group: {
    settings: true,
  },
  settings: {
    finish: true,
  },
};
