import Consola from 'consola';
import { appendPath } from '~/tools/shared/strings';
import { entityStateSchema } from './models/EntityState';

export class HomeAssistant {
  public readonly basePath: URL;
  private readonly token: string;

  constructor(url: URL, token: string) {
    if (!url.pathname.endsWith('/')) {
      url.pathname += "/";
    }
    url.pathname += 'api';
    this.basePath = url;
    this.token = token;
  }

  async getEntityState(entityId: string) {
    try {
      const response = await fetch(appendPath(this.basePath, `/states/${entityId}`), {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      const body = await response.json();
      if (!response.ok) {
        return {
          success: false as const,
          error: body
        };
      }
      return entityStateSchema.safeParseAsync(body);
    } catch (err) {
      Consola.error(`Failed to fetch from '${this.basePath}': ${err}`);
      return {
        success: false as const,
        error: err
      };
    }
  }
}
