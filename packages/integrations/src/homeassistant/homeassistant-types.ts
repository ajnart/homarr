import { z } from "zod/v4";

export const entityStateSchema = z.object({
  attributes: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(), z.number()]))]),
  ),
  entity_id: z.string(),
  last_changed: z.string().pipe(z.coerce.date()),
  last_updated: z.string().pipe(z.coerce.date()),
  state: z.string(),
});

export type EntityState = z.infer<typeof entityStateSchema>;

export const calendarsSchema = z.array(
  z.object({
    name: z.string(),
    entity_id: z.string(),
  }),
);

const calendarMomentSchema = z
  .object({
    date: z.string(),
  })
  .or(
    z.object({
      dateTime: z.string(),
    }),
  );
export const calendarEventSchema = z.object({
  start: calendarMomentSchema,
  end: calendarMomentSchema,
  summary: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
});
