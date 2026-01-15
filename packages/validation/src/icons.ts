import { z } from "zod/v4";

export const iconsFindSchema = z.object({
  searchText: z.string().optional(),
  limitPerGroup: z.number().min(1).max(500).default(12),
});
