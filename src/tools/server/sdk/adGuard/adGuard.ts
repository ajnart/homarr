import { z } from 'zod';
import { trimStringEnding } from '~/tools/shared/strings';
import {
  adGuardApiFilteringStatusSchema,
  adGuardApiStatsResponseSchema,
  adGuardApiStatusResponseSchema,
} from './adGuard.schema';

export class AdGuard {
  private readonly baseHostName: string;

  constructor(
    hostname: string,
    private readonly username: string,
    private readonly password: string
  ) {
    this.baseHostName = trimStringEnding(hostname, ['/#', '/']);
  }

  async getStats(): Promise<AdGuardStatsType> {
    const response = await fetch(`${this.baseHostName}/control/stats`, {
      headers: {
        Authorization: `Basic ${this.getAuthorizationHeaderValue()}`,
      },
    });

    const data = await response.json();

    return adGuardApiStatsResponseSchema.parseAsync(data);
  }

  async getStatus() {
    const response = await fetch(`${this.baseHostName}/control/status`, {
      headers: {
        Authorization: `Basic ${this.getAuthorizationHeaderValue()}`,
      },
    });

    const data = await response.json();

    return adGuardApiStatusResponseSchema.parseAsync(data);
  }

  async getCountFilteringDomains() {
    const response = await fetch(`${this.baseHostName}/control/filtering/status`, {
      headers: {
        Authorization: `Basic ${this.getAuthorizationHeaderValue()}`,
      },
    });

    const data = await response.json();
    const schemaData = await adGuardApiFilteringStatusSchema.parseAsync(data);

    return schemaData.filters
      .filter((filter) => filter.enabled)
      .reduce((sum, filter) => filter.rules_count + sum, 0);
  }

  async disable() {
    await this.changeProtectionStatus(false);
  }
  async enable() {
    await this.changeProtectionStatus(false);
  }

  private async changeProtectionStatus(newStatus: boolean, duration = 0) {
    await fetch(`${this.baseHostName}/control/protection`, {
      method: 'POST',
      body: JSON.stringify({
        enabled: newStatus,
        duration,
      }),
    });
  }

  private getAuthorizationHeaderValue() {
    return Buffer.from(`${this.username}:${this.password}`).toString('base64');
  }
}

export type AdGuardStatsType = z.infer<typeof adGuardApiStatsResponseSchema>;
