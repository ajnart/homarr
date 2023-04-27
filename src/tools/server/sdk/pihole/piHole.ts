import { PiHoleApiStatusChangeResponse, PiHoleApiSummaryResponse } from './piHole.type';

export class PiHoleClient {
  private readonly baseHostName: string;

  constructor(hostname: string, private readonly apiToken: string) {
    this.baseHostName = this.trimStringEnding(hostname, ['/admin/index.php', '/admin', '/']);
  }

  async getSummary() {
    const response = await fetch(
      new URL(`${this.baseHostName}/admin/api.php?summaryRaw&auth=${this.apiToken}`)
    );

    if (response.status !== 200) {
      throw new Error(`Status code does not indicate success: ${response.status}`);
    }

    const json = await response.json();

    if (Array.isArray(json)) {
      throw new Error(
        `Response does not indicate success. Authentication is most likely invalid: ${json}`
      );
    }

    return json as PiHoleApiSummaryResponse;
  }

  async enable() {
    const response = await this.sendStatusChangeRequest('enable');
    return response.status === 'enabled';
  }

  async disable() {
    const response = await this.sendStatusChangeRequest('disable');
    return response.status === 'disabled';
  }

  private async sendStatusChangeRequest(
    action: 'enable' | 'disable'
  ): Promise<PiHoleApiStatusChangeResponse> {
    const response = await fetch(
      `${this.baseHostName}/admin/api.php?${action}&auth=${this.apiToken}`
    );

    if (response.status !== 200) {
      return Promise.reject(new Error(`Status code does not indicate success: ${response.status}`));
    }

    const json = await response.json();

    if (Array.isArray(json)) {
      return Promise.reject(
        new Error(
          `Response does not indicate success. Authentication is most likely invalid: ${json}`
        )
      );
    }

    return json as PiHoleApiStatusChangeResponse;
  }

  private trimStringEnding(original: string, toTrimIfExists: string[]) {
    for (let i = 0; i < toTrimIfExists.length; i += 1) {
      if (!original.endsWith(toTrimIfExists[i])) {
        continue;
      }
      return original.substring(0, original.indexOf(toTrimIfExists[i]));
    }

    return original;
  }
}
