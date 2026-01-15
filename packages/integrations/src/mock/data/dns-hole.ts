import type { DnsHoleSummaryIntegration } from "../../interfaces/dns-hole-summary/dns-hole-summary-integration";
import type { DnsHoleSummary } from "../../types";

export class DnsHoleMockService implements DnsHoleSummaryIntegration {
  private static isEnabled = true;

  public async getSummaryAsync(): Promise<DnsHoleSummary> {
    const blocked = Math.floor(Math.random() * Math.pow(10, 4)) + 1; // Ensure we never devide by zero
    const queries = Math.max(Math.floor(Math.random() * Math.pow(10, 5)), blocked);
    return await Promise.resolve({
      status: DnsHoleMockService.isEnabled ? "enabled" : "disabled",
      domainsBeingBlocked: Math.floor(Math.random() * Math.pow(10, 6)),
      adsBlockedToday: blocked,
      adsBlockedTodayPercentage: blocked / queries,
      dnsQueriesToday: queries,
    });
  }
  public async enableAsync(): Promise<void> {
    DnsHoleMockService.isEnabled = true;
    return await Promise.resolve();
  }
  public async disableAsync(_duration?: number): Promise<void> {
    DnsHoleMockService.isEnabled = false;
    return await Promise.resolve();
  }
}
