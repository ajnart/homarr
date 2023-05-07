export type PiHoleApiSummaryResponse = {
  domains_being_blocked: number;
  dns_queries_today: number;
  ads_blocked_today: number;
  ads_percentage_today: number;
  unique_domains: number;
  queries_forwarded: number;
  queries_cached: number;
  clients_ever_seen: number;
  unique_clients: number;
  dns_queries_all_types: number;
  reply_UNKNOWN: number;
  reply_NODATA: number;
  reply_NXDOMAIN: number;
  reply_CNAME: number;
  reply_IP: number;
  reply_DOMAIN: number;
  reply_RRNAME: number;
  reply_SERVFAIL: number;
  reply_REFUSED: number;
  reply_NOTIMP: number;
  reply_OTHER: number;
  reply_DNSSEC: number;
  reply_NONE: number;
  reply_BLOB: number;
  dns_queries_all_replies: number;
  privacy_level: number;
  status: 'enabled' | 'disabled';
  gravity_last_updated: {
    file_exists: boolean;
    absolute: number;
    relative: { days: number; hours: number; minutes: number };
  };
};

export type PiHoleApiStatusChangeResponse = {
  status: 'enabled' | 'disabled';
};
