import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrSmartHomeEntityStateDefinition = CommonOldmarrWidgetDefinition<
  "smart-home/entity-state",
  {
    entityId: string;
    appendUnit: boolean;
    genericToggle: boolean;
    automationId: string;
    displayName: string;
    displayFriendlyName: boolean;
  }
>;
