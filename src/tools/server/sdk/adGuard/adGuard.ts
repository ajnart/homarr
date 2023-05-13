import { trimStringEnding } from '../../../shared/strings';
import { adGuardApiStatsResponseSchema, adGuardApiStatusResponseSchema } from './adGuard.schema';
import { AdGuardStatsType } from './adGuard.type';

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
