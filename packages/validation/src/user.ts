import type { DayOfWeek } from "@mantine/dates";
import { z } from "zod/v4";

import { colorSchemes } from "@homarr/definitions";
import type { TranslationObject } from "@homarr/translation";

import { zodEnumFromArray } from "./enums";
import { createCustomErrorParams } from "./form/i18n";

// We always want the lowercase version of the username to compare it in a case-insensitive way
export const usernameSchema = z.string().trim().toLowerCase().min(3).max(255);

const regexCheck = (regex: RegExp) => (value: string) => regex.test(value);
export const passwordRequirements = [
  { check: (value) => value.length >= 8, value: "length" },
  { check: regexCheck(/[a-z]/), value: "lowercase" },
  { check: regexCheck(/[A-Z]/), value: "uppercase" },
  { check: regexCheck(/\d/), value: "number" },
  { check: regexCheck(/[$&+,:;=?@#|'<>.^*()%!\-~`"_/\\[\]{}]/), value: "special" },
] satisfies {
  check: (value: string) => boolean;
  value: keyof TranslationObject["user"]["field"]["password"]["requirement"];
}[];

export const userPasswordSchema = z
  .string()
  .min(8)
  .max(255)
  .refine(
    (value) => {
      return passwordRequirements.every((requirement) => requirement.check(value));
    },
    {
      params: createCustomErrorParams({
        key: "passwordRequirements",
        params: {},
      }),
    },
  );

const addConfirmPasswordRefinement = <
  TSchema extends z.ZodObject<{ password: z.core.$ZodString; confirmPassword: z.core.$ZodString }, z.core.$strip>,
>(
  schema: TSchema,
) => {
  return schema.refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    params: createCustomErrorParams({
      key: "passwordsDoNotMatch",
      params: {},
    }),
  });
};

export const userBaseCreateSchema = z.object({
  username: usernameSchema,
  password: userPasswordSchema,
  confirmPassword: z.string(),
  email: z.string().email().or(z.string().length(0)).optional(),
  groupIds: z.array(z.string()),
});

export const userCreateSchema = addConfirmPasswordRefinement(userBaseCreateSchema);

export const userInitSchema = addConfirmPasswordRefinement(userBaseCreateSchema.omit({ groupIds: true }));

export const userSignInSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
});

export const ldapSignInSchema = z.object({
  name: z
    .string()
    .min(1)
    // Prevent special characters that could lead to LDAP injection attacks
    .regex(/^[^\\,+<>;"=)(*|!&]+$/, {
      message: "Invalid characters in ldap username",
    }),
  password: z.string().min(1),
});

export const userRegistrationSchema = addConfirmPasswordRefinement(
  z.object({
    username: usernameSchema,
    password: userPasswordSchema,
    confirmPassword: z.string(),
  }),
);

export const userRegistrationApiSchema = userRegistrationSchema.and(
  z.object({
    inviteId: z.string(),
    token: z.string(),
  }),
);

export const userEditProfileSchema = z.object({
  id: z.string(),
  name: usernameSchema,
  email: z
    .string()
    .email()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value))
    .optional()
    .nullable(),
});

const baseChangePasswordSchema = z.object({
  previousPassword: z.string().min(1),
  password: userPasswordSchema,
  confirmPassword: z.string(),
  userId: z.string(),
});

export const userChangePasswordSchema = addConfirmPasswordRefinement(baseChangePasswordSchema.omit({ userId: true }));

export const userChangePasswordApiSchema = addConfirmPasswordRefinement(baseChangePasswordSchema);

export const userChangeHomeBoardsSchema = z.object({
  homeBoardId: z.string().nullable(),
  mobileHomeBoardId: z.string().nullable(),
});

export const userChangeSearchPreferencesSchema = z.object({
  defaultSearchEngineId: z.string().min(1).nullable(),
  openInNewTab: z.boolean(),
});

export const userChangeColorSchemeSchema = z.object({
  colorScheme: zodEnumFromArray(colorSchemes),
});

export const userFirstDayOfWeekSchema = z.object({
  firstDayOfWeek: z
    .custom<DayOfWeek>((value) => z.number().min(0).max(6).safeParse(value).success)
    .meta({
      override: {
        type: "integer",
        minimum: 0,
        maximum: 6,
      },
    }),
});

export const userPingIconsEnabledSchema = z.object({
  pingIconsEnabled: z.boolean(),
});
