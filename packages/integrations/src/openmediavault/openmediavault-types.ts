import { z } from "zod/v4";

// Schema for system information
export const systemInformationSchema = z.object({
  response: z.object({
    version: z.string(),
    cpuModelName: z.string().nullable(),
    cpuUtilization: z.number(),
    memUsed: z.string(),
    memAvailable: z.string(),
    uptime: z.number(),
    loadAverage: z.object({
      "1min": z.number(),
      "5min": z.number(),
      "15min": z.number(),
    }),
    rebootRequired: z.boolean(),
    availablePkgUpdates: z.number(),
  }),
});

// Schema for file systems
export const fileSystemSchema = z.object({
  response: z.array(
    z.object({
      devicename: z.string(),
      used: z.string(),
      available: z.string().or(z.number()),
      percentage: z.number(),
    }),
  ),
});

// Schema for SMART information
export const smartSchema = z.object({
  response: z.array(
    z.object({
      devicename: z.string(),
      temperature: z.union([z.string(), z.number()]).transform((val) => {
        // Convert string to number if necessary
        const temp = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(temp)) {
          return null;
        }
        return temp;
      }),
      overallstatus: z.string(),
    }),
  ),
});

// Schema for CPU temperature
export const cpuTempSchema = z.object({
  response: z.object({
    cputemp: z.number(),
  }),
});
