import { z } from "zod/v4";

import { tileBaseSchema } from "./tile";

const appBehaviourSchema = z.object({
  externalUrl: z.string(),
  isOpeningNewTab: z.boolean().catch(true),
  tooltipDescription: z.string().optional().catch(undefined),
});

const appNetworkSchema = z.object({
  enabledStatusChecker: z.boolean().catch(true),
  okStatus: z.array(z.number()).optional().catch([]),
  statusCodes: z.array(z.string()).catch([]),
});

const appAppearanceSchema = z.object({
  iconUrl: z.string(),
  appNameStatus: z.union([z.literal("normal"), z.literal("hover"), z.literal("hidden")]).catch("normal"),
  positionAppName: z
    .union([z.literal("row"), z.literal("column"), z.literal("row-reverse"), z.literal("column-reverse")])
    .catch("column"),
  appNameFontSize: z.number().catch(16),
  lineClampAppName: z.number().catch(1),
});

const integrationSchema = z.enum([
  "readarr",
  "radarr",
  "sonarr",
  "lidarr",
  "prowlarr",
  "sabnzbd",
  "jellyseerr",
  "overseerr",
  "deluge",
  "qBittorrent",
  "transmission",
  "plex",
  "jellyfin",
  "nzbGet",
  "pihole",
  "adGuardHome",
  "homeAssistant",
  "openmediavault",
  "proxmox",
  "tdarr",
]);

export type OldmarrIntegrationType = z.infer<typeof integrationSchema>;

const appIntegrationPropertySchema = z.object({
  type: z.enum(["private", "public"]),
  field: z.enum(["apiKey", "password", "username"]),
  value: z.string().nullable().optional(),
  isDefined: z.boolean().optional(),
});

const appIntegrationSchema = z.object({
  type: integrationSchema.optional().nullable(),
  properties: z.array(appIntegrationPropertySchema),
});

export const oldmarrAppSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    behaviour: appBehaviourSchema,
    network: appNetworkSchema,
    appearance: appAppearanceSchema,
    integration: appIntegrationSchema.optional().nullable(),
  })
  .and(tileBaseSchema);

export type OldmarrApp = z.infer<typeof oldmarrAppSchema>;
