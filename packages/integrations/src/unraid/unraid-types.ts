import z from "zod";

export const unraidSystemInfoSchema = z.object({
  metrics: z.object({
    cpu: z.object({
      percentTotal: z.number(),
      cpus: z.array(
        z.object({
          percentTotal: z.number(),
        }),
      ),
    }),
    memory: z.object({
      available: z.number(),
      used: z.number(),
      free: z.number(),
      total: z.number().min(0),
      percentTotal: z.number().min(0).max(100),
    }),
  }),
  array: z.object({
    state: z.string(),
    capacity: z.object({
      disks: z.object({
        free: z.coerce.number(),
        total: z.coerce.number(),
        used: z.coerce.number(),
      }),
    }),
    disks: z.array(
      z.object({
        name: z.string(),
        size: z.number(),
        fsFree: z.number(),
        fsUsed: z.number(),
        status: z.string(),
        temp: z.number().nullish(),
      }),
    ),
  }),
  info: z.object({
    devices: z.object({
      network: z.array(
        z.object({
          speed: z.number(),
          dhcp: z.boolean(),
          model: z.string(),
        }),
      ),
    }),
    os: z.object({
      platform: z.string(),
      distro: z.string(),
      release: z.string(),
      uptime: z.coerce.date(),
    }),
    cpu: z.object({
      manufacturer: z.string(),
      brand: z.string(),
      cores: z.number(),
      threads: z.number(),
    }),
    memory: z.object({
      layout: z.array(
        z.object({
          size: z.number(),
        }),
      ),
    }),
  }),
});

export type UnraidSystemInfo = z.infer<typeof unraidSystemInfoSchema>;
