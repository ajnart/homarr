import axios from 'axios';
import Consola from 'consola';
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

  async disable(duration: number) {
    await this.changeProtectionStatus(false, duration);
  }
  async enable() {
    await this.changeProtectionStatus(true);
  }

  /**
   * Make a post request to the AdGuard API to change the protection status based on the value of newStatus
   * @param {boolean} newStatus - The new status of the protection
   * @param {number} duration - Duration of a pause, in seconds. Enabled should be false.
   * @returns {string} - The response from the AdGuard API
   */
  private async changeProtectionStatus(newStatus: boolean, duration = 0) {
    try {
      const { data }: { data: string } = await axios.post(
        `${this.baseHostName}/control/protection`,
        {
          enabled: newStatus,
          duration: duration * 1000,
        },
        {
          headers: {
            Authorization: `Basic ${this.getAuthorizationHeaderValue()}`,
          },
        }
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Consola.error(error.message);
      }
    }
  }

  /**
   * It return a base64 username:password string
   * @returns {string} The base64 encoded username and password
   */
  private getAuthorizationHeaderValue() {
    return Buffer.from(`${this.username}:${this.password}`).toString('base64');
  }
}

export type AdGuardStatsType = z.infer<typeof adGuardApiStatsResponseSchema>;
