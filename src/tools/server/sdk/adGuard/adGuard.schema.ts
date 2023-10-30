import { z } from 'zod';

export const adGuardApiStatsResponseSchema = z.object({
  time_units: z.enum(['hours', 'days']),
  top_queried_domains: z.array(z.record(z.string(), z.number())),
  top_clients: z.array(z.record(z.string(), z.number())),
  top_blocked_domains: z.array(z.record(z.string(), z.number())),
  dns_queries: z.array(z.number()),
  blocked_filtering: z.array(z.number()),
  replaced_safebrowsing: z.array(z.number()),
  replaced_parental: z.array(z.number()),
  num_dns_queries: z.number().min(0),
  num_blocked_filtering: z.number().min(0),
  num_replaced_safebrowsing: z.number().min(0),
  num_replaced_safesearch: z.number().min(0),
  num_replaced_parental: z.number().min(0),
  avg_processing_time: z.number().min(0),
});

export const adGuardApiStatusResponseSchema = z.object({
  version: z.string(),
  language: z.string(),
  dns_addresses: z.array(z.string()),
  dns_port: z.number().positive(),
  http_port: z.number().positive(),
  protection_disabled_duration: z.number(),
  protection_enabled: z.boolean(),
  dhcp_available: z.boolean(),
  running: z.boolean(),
});

export const adGuardApiFilteringStatusSchema = z.object({
  filters: z.array(
    z.object({
      url: z.string(),
      name: z.string(),
      last_updated: z.string().optional(),
      id: z.number().nonnegative(),
      rules_count: z.number().nonnegative(),
      enabled: z.boolean(),
    })
  ),
});
