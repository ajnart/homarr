import { z } from "zod/v4";

import { integrationKinds, integrationPermissions, integrationSecretKinds } from "@homarr/definitions";

import { appManageSchema } from "./app";
import { zodEnumFromArray } from "./enums";
import { createSavePermissionsSchema } from "./permissions";

export const integrationCreateSchema = z.object({
  name: z.string().nonempty().max(127),
  url: z
    .string()
    .url()
    .regex(/^https?:\/\//), // Only allow http and https for security reasons (javascript: is not allowed)
  kind: zodEnumFromArray(integrationKinds),
  secrets: z.array(
    z.object({
      kind: zodEnumFromArray(integrationSecretKinds),
      value: z.string().nonempty(),
    }),
  ),
  attemptSearchEngineCreation: z.boolean(),
  app: z
    .object({
      id: z.string(),
    })
    .or(appManageSchema)
    .optional(),
});

export const integrationUpdateSchema = z.object({
  id: z.string().cuid2(),
  name: z.string().nonempty().max(127),
  url: z.string().url(),
  secrets: z.array(
    z.object({
      kind: zodEnumFromArray(integrationSecretKinds),
      value: z.string().nullable(),
    }),
  ),
  appId: z.string().nullable(),
});

export const integrationSavePermissionsSchema = createSavePermissionsSchema(zodEnumFromArray(integrationPermissions));
