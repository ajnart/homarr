import { z } from "zod/v4";

export const appHrefSchema = z
  .string()
  .trim()
  .url()
  .regex(/^(?!javascript)[a-zA-Z]*:\/\//i) // javascript: is not allowed, i for case insensitive (so Javascript: is also not allowed)
  .or(z.literal(""))
  .transform((value) => (value.length === 0 ? null : value))
  .nullable();

export const appManageSchema = z.object({
  name: z.string().trim().min(1).max(64),
  description: z
    .string()
    .trim()
    .max(512)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable(),
  iconUrl: z.string().trim().min(1),
  href: appHrefSchema,
  pingUrl: z
    .string()
    .trim()
    .url()
    .regex(/^https?:\/\//) // Only allow http and https for security reasons (javascript: is not allowed)
    .or(z.literal(""))
    .transform((value) => (value.length === 0 ? null : value))
    .nullable(),
});

export const appCreateManySchema = z
  .array(appManageSchema.omit({ iconUrl: true }).and(z.object({ iconUrl: z.string().min(1).nullable() })))
  .min(1);

export const appEditSchema = appManageSchema.and(z.object({ id: z.string() }));
