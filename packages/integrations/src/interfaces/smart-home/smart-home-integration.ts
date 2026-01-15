import type { EntityStateResult } from "./smart-home-types";

export interface ISmartHomeIntegration {
  getEntityStateAsync(entityId: string): Promise<EntityStateResult>;
  triggerAutomationAsync(entityId: string): Promise<boolean>;
  triggerToggleAsync(entityId: string): Promise<boolean>;
}
