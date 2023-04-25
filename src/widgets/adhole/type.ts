export type AdStatistics = {
  domainsBeingBlocked: number;
  adsBlockedToday: number;
  adsBlockedTodayPercentage: number;
  dnsQueriesToday: number;
  status: {
    status: PiholeApiSummaryType['status'],
    appId: string;
  }[];
};

export type PiholeApiSummaryType = {
  domains_being_blocked: string;
  dns_queries_today: string;
  ads_blocked_today: string;
  ads_percentage_today: number;
  unique_domains: string;
  queries_forwarded: string;
  queries_cached: string;
  clients_ever_seen: number;
  unique_clients: number;
  dns_queries_all_types: string;
  reply_UNKNOWN: number;
  reply_NODATA: string;
  reply_NXDOMAIN: string;
  reply_CNAME: string;
  reply_IP: string;
  reply_DOMAIN: number;
  reply_RRNAME: number;
  reply_SERVFAIL: number;
  reply_REFUSED: number;
  reply_NOTIMP: number;
  reply_OTHER: number;
  reply_DNSSEC: number;
  reply_NONE: number;
  reply_BLOB: number;
  dns_queries_all_replies: string;
  privacy_level: number;
  status: 'enabled' | 'disabled';
  gravity_last_updated: {
    file_exists: boolean;
    absolute: number;
    relative: { days: number; hours: number; minutes: number };
  };
};
