import { z } from "zod/v4";

export const paginatedSchema = z.object({
  search: z.string().optional(),
  pageSize: z.number().int().positive().default(10),
  page: z.number().int().positive().default(1),
});

export const byIdSchema = z.object({
  id: z.string(),
});

export const searchSchema = z.object({
  query: z.string(),
  limit: z.number().int().positive().default(10),
});
