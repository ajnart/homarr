import { z } from "zod/v4";

import { oldmarrAppSchema } from "./app";
import { settingsSchema } from "./setting";
import { oldmarrWidgetSchema } from "./widget";

const categorySchema = z.object({
  id: z.string(),
  position: z.number(),
  name: z.string(),
});

const wrapperSchema = z.object({
  id: z.string(),
  position: z.number(),
});

export const oldmarrConfigSchema = z.object({
  schemaVersion: z.number(),
  configProperties: z.object({
    name: z.string(),
  }),
  categories: z.array(categorySchema),
  wrappers: z.array(wrapperSchema),
  apps: z.array(oldmarrAppSchema),
  widgets: z.array(oldmarrWidgetSchema),
  settings: settingsSchema,
});

export type OldmarrConfig = z.infer<typeof oldmarrConfigSchema>;
export type OldmarrCategorySection = z.infer<typeof categorySchema>;
export type OldmarrEmptySection = z.infer<typeof wrapperSchema>;
