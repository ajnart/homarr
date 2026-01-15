export interface DnsHoleSummary {
  status?: "enabled" | "disabled";
  domainsBeingBlocked: number;
  adsBlockedToday: number;
  adsBlockedTodayPercentage: number;
  dnsQueriesToday: number;
}
