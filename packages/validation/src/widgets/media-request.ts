import { z } from "zod/v4";

export const mediaRequestOptionsSchema = z.object({
  mediaId: z.number(),
  mediaType: z.enum(["tv", "movie"]),
});

export const mediaRequestRequestSchema = z.object({
  mediaType: z.enum(["tv", "movie"]),
  mediaId: z.number(),
  seasons: z.array(z.number().min(0)).optional(),
});
