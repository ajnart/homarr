export type AdGuardStatsType = {
  time_units: string;
  top_queried_domains: { [key: string]: number }[];
  top_clients: { [key: string]: number }[];
  top_blocked_domains: { [key: string]: number }[];
  dns_queries: number[];
  blocked_filtering: number[];
  replaced_safebrowsing: number[];
  replaced_parental: number[];
  num_dns_queries: number;
  num_blocked_filtering: number;
  num_replaced_safebrowsing: number;
  num_replaced_safesearch: number;
  num_replaced_parental: number;
  avg_processing_time: number;
};
