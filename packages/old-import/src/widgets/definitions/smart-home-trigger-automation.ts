import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrSmartHomeTriggerAutomationDefinition = CommonOldmarrWidgetDefinition<
  "smart-home/trigger-automation",
  {
    automationId: string;
    displayName: string;
  }
>;
