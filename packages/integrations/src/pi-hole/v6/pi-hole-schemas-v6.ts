import { z } from "zod/v4";

export const sessionResponseSchema = z.object({
  session: z.object({
    valid: z.boolean(),
    sid: z.string().nullable(),
    message: z.string().nullable(),
  }),
});

export const dnsBlockingGetSchema = z.object({
  blocking: z.enum(["enabled", "disabled", "failed", "unknown"]).transform((value) => {
    if (value === "failed") return undefined;
    if (value === "unknown") return undefined;
    return value;
  }),
  timer: z.number().nullable(),
});

export const statsSummaryGetSchema = z.object({
  queries: z.object({
    total: z.number(),
    blocked: z.number(),
    percent_blocked: z.number(),
  }),
  gravity: z.object({
    domains_being_blocked: z.number(),
  }),
});
