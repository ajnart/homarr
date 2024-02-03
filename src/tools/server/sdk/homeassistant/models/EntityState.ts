import { z } from 'zod';


export const entityStateSchema = z.object({
  attributes: z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(),z.number()]))])),
  entity_id: z.string(),
  last_changed: z.string().pipe(z.coerce.date()),
  last_updated: z.string().pipe(z.coerce.date()),
  state: z.string(),
});

export type EntityState = z.infer<typeof entityStateSchema>;
