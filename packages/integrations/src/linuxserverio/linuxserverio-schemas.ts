import { z } from "zod/v4";

export const releasesResponseSchema = z.object({
  data: z.object({
    repositories: z.object({
      linuxserver: z.array(
        z.object({
          name: z.string(),
          initial_date: z
            .string()
            .transform((value) => new Date(value))
            .optional(),
          github_url: z.string(),
          description: z.string(),
          version: z.string(),
          version_timestamp: z.string().transform((value) => new Date(value)),
          stars: z.number(),
          deprecated: z.boolean(),
          changelog: z
            .array(
              z.object({
                date: z.string().transform((value) => new Date(value)),
                desc: z.string(),
              }),
            )
            .optional(),
        }),
      ),
    }),
  }),
});
