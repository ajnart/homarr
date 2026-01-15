import type { ISmartHomeIntegration } from "../../interfaces/smart-home/smart-home-integration";
import type { EntityStateResult } from "../../interfaces/smart-home/smart-home-types";

export class SmartHomeMockService implements ISmartHomeIntegration {
  public async getEntityStateAsync(entityId: string): Promise<EntityStateResult> {
    return await Promise.resolve({
      success: true as const,
      data: {
        entity_id: entityId,
        state: "on",
        attributes: {
          friendly_name: `Mock Entity ${entityId}`,
          device_class: "light",
          supported_features: 1,
        },
        last_changed: new Date(),
        last_updated: new Date(),
      },
    });
  }
  public async triggerAutomationAsync(_entityId: string): Promise<boolean> {
    return await Promise.resolve(true);
  }
  public async triggerToggleAsync(_entityId: string): Promise<boolean> {
    return await Promise.resolve(true);
  }
}
