import Consola from 'consola';
import { appendPath } from '~/tools/shared/strings';
import { entityStateSchema } from './models/EntityState';

export class HomeAssistant {
  public readonly basePath: URL;
  private readonly token: string;

  constructor(url: URL, token: string) {
    if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
    }
    url.pathname += 'api';
    this.basePath = url;
    this.token = token;
  }

  async getEntityState(entityId: string) {
    try {
      const response = await fetch(appendPath(this.basePath, `/states/${entityId}`), {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      const body = await response.json();
      if (!response.ok) {
        return {
          success: false as const,
          error: body,
        };
      }
      return entityStateSchema.safeParseAsync(body);
    } catch (err) {
      Consola.error(`Failed to fetch from '${this.basePath}': ${err}`);
      return {
        success: false as const,
        error: err,
      };
    }
  }

  async triggerAutomation(entityId: string) {
    try {
      const response = await fetch(appendPath(this.basePath, `/services/automation/trigger`), {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          'entity_id': entityId,
        }),
        method: 'POST'
      });
      return response.ok;
    } catch (err) {
      Consola.error(`Failed to fetch from '${this.basePath}': ${err}`);
      return false;
    }
  }

  /**
   * Triggers a toggle action for a specific entity.
   * 
   * @param entityId - The ID of the entity to toggle.
   * @returns A boolean indicating whether the toggle action was successful.
   */
  async triggerToggle(entityId: string) {
    try {
      const response = await fetch(appendPath(this.basePath, `/services/homeassistant/toggle`), {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          'entity_id': entityId,
        }),
        method: 'POST'
      });
      return response.ok;
    } catch (err) {
      Consola.error(`Failed to fetch from '${this.basePath}': ${err}`);
      return false;
    }
  }
}
