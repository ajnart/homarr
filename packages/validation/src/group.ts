import { z } from "zod/v4";

import { everyoneGroup, groupPermissionKeys } from "@homarr/definitions";

import { byIdSchema } from "./common";
import { zodEnumFromArray } from "./enums";

export const groupCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .refine((value) => value !== everyoneGroup, {
      message: "'everyone' is a reserved group name",
    }),
});

export const groupUpdateSchema = groupCreateSchema.merge(byIdSchema);

export const groupSettingsSchema = z.object({
  homeBoardId: z.string().nullable(),
  mobileHomeBoardId: z.string().nullable(),
});

export const groupSavePartialSettingsSchema = z.object({
  id: z.string(),
  settings: groupSettingsSchema.partial(),
});

export const groupSavePermissionsSchema = z.object({
  groupId: z.string(),
  permissions: z.array(zodEnumFromArray(groupPermissionKeys)),
});

export const groupSavePositionsSchema = z.object({
  positions: z.array(z.string()),
});

export const groupUserSchema = z.object({ groupId: z.string(), userId: z.string() });
