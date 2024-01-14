import { z } from 'zod';

export const calendarMediaEventSchema = z.object({
  type: z.literal('media'),
  name: z.string(),
  subName: z.string().optional(),
  description: z.string().optional(),
  date: z.date(),
  poster: z.string().url().optional(),
  links: z.array(z.object({
    href: z.string().url(),
    name: z.string(),
    color: z.string().optional(),
    isDark: z.boolean().optional(),
    logo: z.string().optional()
  })),
  content: z.discriminatedUnion('mediaType', [
    z.object({
      mediaType: z.literal('series'),
      seasonNumber: z.number(),
      episodeNumber: z.number(),
    }),
    z.object({
      mediaType: z.literal('movie'),
    }),
    z.object({
      mediaType: z.literal('book'),
    }),
    z.object({
      mediaType: z.literal('music'),
    }),
  ]),
});

export const calendarEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('generic'),
    name: z.string(),
    date: z.date(),
  }),
  calendarMediaEventSchema,
]);

export const calendarEvents = z.object({
  events: z.array(calendarEventSchema),
});