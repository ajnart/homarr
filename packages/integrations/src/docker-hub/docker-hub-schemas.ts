import { z } from "zod/v4";

export const accessTokenResponseSchema = z.object({
  access_token: z.string(),
});

export const releasesResponseSchema = z.object({
  results: z.array(
    z.object({ name: z.string(), last_updated: z.string().transform((value) => new Date(value)) }).transform((tag) => ({
      latestRelease: tag.name,
      latestReleaseAt: tag.last_updated,
    })),
  ),
});

export const detailsResponseSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  description: z.string(),
  star_count: z.number(),
  date_registered: z.string().transform((value) => new Date(value)),
});
