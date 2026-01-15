import { ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import type { IntegrationTestingInput } from "../../base/integration";
import { Integration } from "../../base/integration";
import { TestConnectionError } from "../../base/test-connection/test-connection-error";
import type { TestingResult } from "../../base/test-connection/test-connection-service";
import type { DnsHoleSummaryIntegration } from "../../interfaces/dns-hole-summary/dns-hole-summary-integration";
import type { DnsHoleSummary } from "../../interfaces/dns-hole-summary/dns-hole-summary-types";
import { summaryResponseSchema } from "./pi-hole-schemas-v5";

export class PiHoleIntegrationV5 extends Integration implements DnsHoleSummaryIntegration {
  public async getSummaryAsync(): Promise<DnsHoleSummary> {
    const apiKey = super.getSecretValue("apiKey");
    const response = await fetchWithTrustedCertificatesAsync(this.url("/admin/api.php?summaryRaw", { auth: apiKey }));
    if (!response.ok) {
      throw new ResponseError(response);
    }

    const data = await summaryResponseSchema.parseAsync(await response.json());

    return {
      status: data.status,
      adsBlockedToday: data.ads_blocked_today,
      adsBlockedTodayPercentage: data.ads_percentage_today,
      domainsBeingBlocked: data.domains_being_blocked,
      dnsQueriesToday: data.dns_queries_today,
    };
  }

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const apiKey = super.getSecretValue("apiKey");

    const response = await input.fetchAsync(this.url("/admin/api.php?status", { auth: apiKey }));

    if (!response.ok) return TestConnectionError.StatusResult(response);

    const data = await response.json();

    // Pi-hole v5 returned an empty array if the API key is wrong
    if (typeof data !== "object" || Array.isArray(data)) {
      return TestConnectionError.UnauthorizedResult(401);
    }

    return { success: true };
  }

  public async enableAsync(): Promise<void> {
    const apiKey = super.getSecretValue("apiKey");
    const response = await fetchWithTrustedCertificatesAsync(this.url("/admin/api.php?enable", { auth: apiKey }));
    if (!response.ok) {
      throw new Error(
        `Failed to enable PiHole for ${this.integration.name} (${this.integration.id}): ${response.statusText}`,
      );
    }
  }

  public async disableAsync(duration?: number): Promise<void> {
    const apiKey = super.getSecretValue("apiKey");
    const url = this.url(`/admin/api.php?disable${duration ? `=${duration}` : ""}`, { auth: apiKey });
    const response = await fetchWithTrustedCertificatesAsync(url);
    if (!response.ok) {
      throw new Error(
        `Failed to disable PiHole for ${this.integration.name} (${this.integration.id}): ${response.statusText}`,
      );
    }
  }
}
