import { z } from 'zod';

import { appSchema } from './app';
import { widgetSchema } from './widget';

export const itemSchema = widgetSchema.or(appSchema);

export const emptySectionSchema = z.object({
  id: z.string(),
  kind: z.literal('empty'),
  position: z.number(),
  items: z.array(itemSchema),
});

export const hiddenSectionSchema = z.object({
  id: z.string(),
  kind: z.literal('hidden'),
  position: z.null(),
  items: z.array(itemSchema),
});

export const categorySectionSchema = z.object({
  id: z.string(),
  kind: z.literal('category'),
  position: z.number(),
  items: z.array(itemSchema),
  name: z.string(),
});

export const sidebarSectionSchema = z.object({
  id: z.string(),
  kind: z.literal('sidebar'),
  position: z.enum(['left', 'right']),
  items: z.array(itemSchema),
});

export const sectionSchema = emptySectionSchema
  .or(hiddenSectionSchema)
  .or(categorySectionSchema)
  .or(sidebarSectionSchema);
