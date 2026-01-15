import { z } from "zod/v4";

// API documentation : https://docs.opnsense.org/development/api.html#core-api

export const opnsenseSystemSummarySchema = z.object({
  name: z.string(),
  versions: z.array(z.string()),
});

export const opnsenseMemorySchema = z.object({
  memory: z.object({
    total: z.string(),
    used: z.number(),
  }),
});

const interfaceSchema = z.object({
  "bytes received": z.string(),
  "bytes transmitted": z.string(),
  name: z.string(),
});

export const opnsenseInterfacesSchema = z.object({
  interfaces: z.record(z.string(), interfaceSchema),
  time: z.number(),
});

export const opnsenseCPUSchema = z.object({
  total: z.number(),
});
