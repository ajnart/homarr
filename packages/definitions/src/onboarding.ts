export const onboardingSteps = ["start", "import", "user", "group", "settings", "finish"] as const;
export type OnboardingStep = (typeof onboardingSteps)[number];
