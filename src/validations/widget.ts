import { z } from 'zod';
import { widgetSorts } from '~/server/db/items';

import { appSchema } from './app';
import { commonItemSchema } from './item';

export const widgetSortSchema = z.enum([widgetSorts[0], ...widgetSorts.slice(1)]);

export const widgetCreationSchema = z.object({
  id: z.string(),
  kind: z.literal('widget'),
  sort: widgetSortSchema,
  options: z.record(z.string(), z.unknown()),
});

export const widgetSchema = widgetCreationSchema.merge(commonItemSchema);
