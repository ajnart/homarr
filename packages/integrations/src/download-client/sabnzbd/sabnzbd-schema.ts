import { z } from "zod/v4";

export const queueSchema = z.object({
  queue: z.object({
    paused: z.boolean(),
    kbpersec: z.string(),
    slots: z.array(
      z.object({
        status: z.string(),
        index: z.number(),
        mb: z.string(),
        filename: z.string(),
        cat: z.string(),
        timeleft: z.string(),
        percentage: z.string(),
        nzo_id: z.string(),
      }),
    ),
  }),
});

export const historySchema = z.object({
  history: z.object({
    slots: z.array(
      z.object({
        category: z.string(),
        download_time: z.number(),
        status: z.string(),
        completed: z.number(),
        nzo_id: z.string(),
        postproc_time: z.number(),
        name: z.string(),
        bytes: z.number(),
      }),
    ),
  }),
});
