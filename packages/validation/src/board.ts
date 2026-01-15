import { z } from "zod/v4";

import {
  backgroundImageAttachments,
  backgroundImageRepeats,
  backgroundImageSizes,
  boardPermissions,
} from "@homarr/definitions";

import { zodEnumFromArray } from "./enums";
import { createSavePermissionsSchema } from "./permissions";
import { commonItemSchema, sectionSchema } from "./shared";

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

const hexColorNullableSchema = hexColorSchema
  .or(z.literal(""))
  .nullable()
  .transform((value) => (value?.trim().length === 0 ? null : value));

export const boardNameSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[A-Za-z0-9-_]*$/);
export const boardColumnCountSchema = z.number().min(1).max(24);

export const boardByNameSchema = z.object({
  name: boardNameSchema,
});

export const boardRenameSchema = z.object({
  id: z.string(),
  name: boardNameSchema,
});

export const boardDuplicateSchema = z.object({
  id: z.string(),
  name: boardNameSchema,
});

export const boardChangeVisibilitySchema = z.object({
  id: z.string(),
  visibility: z.enum(["public", "private"]),
});

const trimmedNullableString = z
  .string()
  .nullable()
  .transform((value) => (value?.trim().length === 0 ? null : value));

export const boardSavePartialSettingsSchema = z
  .object({
    pageTitle: trimmedNullableString,
    metaTitle: trimmedNullableString,
    logoImageUrl: trimmedNullableString,
    faviconImageUrl: trimmedNullableString,
    backgroundImageUrl: trimmedNullableString,
    backgroundImageAttachment: z.enum(backgroundImageAttachments.values),
    backgroundImageRepeat: z.enum(backgroundImageRepeats.values),
    backgroundImageSize: z.enum(backgroundImageSizes.values),
    primaryColor: hexColorSchema,
    secondaryColor: hexColorSchema,
    opacity: z.number().min(0).max(100),
    customCss: z.string().max(16384),
    iconColor: hexColorNullableSchema,
    itemRadius: z.union([z.literal("xs"), z.literal("sm"), z.literal("md"), z.literal("lg"), z.literal("xl")]),
    disableStatus: z.boolean(),
  })
  .partial();

export const boardSaveLayoutsSchema = z.object({
  id: z.string(),
  layouts: z.array(
    z.object({
      id: z.string(),
      name: z.string().trim().nonempty().max(32),
      columnCount: boardColumnCountSchema,
      breakpoint: z.number().min(0).max(32767),
    }),
  ),
});

export const boardSaveSchema = z.object({
  id: z.string(),
  sections: z.array(sectionSchema),
  items: z.array(commonItemSchema),
});

export const boardCreateSchema = z.object({
  name: boardNameSchema,
  columnCount: boardColumnCountSchema,
  isPublic: z.boolean(),
});

export const boardSavePermissionsSchema = createSavePermissionsSchema(zodEnumFromArray(boardPermissions));
