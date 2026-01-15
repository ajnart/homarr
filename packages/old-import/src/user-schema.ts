import { z } from "zod/v4";

const regexEncryptedSchema = z.string().regex(/^[a-f0-9]+\.[a-f0-9]+$/g);

const encryptedSchema = z.custom<`${string}.${string}`>((value) => regexEncryptedSchema.safeParse(value).success);

export const oldmarrImportUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  isAdmin: z.boolean(),
  isOwner: z.boolean(),
  settings: z
    .object({
      colorScheme: z.enum(["environment", "light", "dark"]),
      defaultBoard: z.string(),
      firstDayOfWeek: z.enum(["monday", "saturday", "sunday"]),
      replacePingWithIcons: z.boolean(),
    })
    .nullable(),
  password: encryptedSchema,
  salt: encryptedSchema,
});

export type OldmarrImportUser = z.infer<typeof oldmarrImportUserSchema>;
