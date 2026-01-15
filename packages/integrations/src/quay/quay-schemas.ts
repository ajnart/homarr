import { z } from "zod/v4";

export const releasesResponseSchema = z.object({
  description: z.string().optional(),
  tags: z.record(
    z.string(),
    z.object({
      name: z.string(),
      last_modified: z.string(),
    }),
  ),
});
