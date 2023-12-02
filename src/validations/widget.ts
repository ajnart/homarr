import { z } from 'zod';
import { widgetTypes } from '~/server/db/items';

import { commonItemSchema } from './item';

export const widgetTypeSchema = z.enum([widgetTypes[0], ...widgetTypes.slice(1)]);

export const widgetCreationSchema = z.object({
  id: z.string(),
  kind: z.literal('widget'),
  type: widgetTypeSchema,
  options: z.record(z.string(), z.unknown()),
});

export const widgetSchema = widgetCreationSchema.merge(commonItemSchema);
