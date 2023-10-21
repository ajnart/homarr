import { z } from 'zod';
import { widgetSorts } from '~/server/db/items';

export const widgetSortSchema = z.enum([widgetSorts[0], ...widgetSorts.slice(1)]);

export const widgetCreationSchema = z.object({
  id: z.string(),
  type: z.literal('widget'),
  sort: widgetSortSchema,
  options: z.record(z.string(), z.unknown()),
});

export const widgetSchema = z
  .object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  })
  .merge(widgetCreationSchema);
