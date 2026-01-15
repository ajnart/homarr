import { z } from "zod/v4";

import { tileBaseSchema } from "./tile";

export const oldmarrWidgetKinds = [
  "calendar",
  "indexer-manager",
  "dashdot",
  "usenet",
  "weather",
  "torrents-status",
  "dlspeed",
  "date",
  "rss",
  "video-stream",
  "iframe",
  "media-server",
  "media-requests-list",
  "media-requests-stats",
  "dns-hole-summary",
  "dns-hole-controls",
  "bookmark",
  "notebook",
  "smart-home/entity-state",
  "smart-home/trigger-automation",
  "health-monitoring",
  "media-transcoding",
] as const;

export type OldmarrWidgetKind = (typeof oldmarrWidgetKinds)[number];

export const oldmarrWidgetSchema = z
  .object({
    id: z.string(),
    type: z.enum(oldmarrWidgetKinds),
    properties: z.record(z.string(), z.unknown()),
  })
  .and(tileBaseSchema);

export type OldmarrWidget = z.infer<typeof oldmarrWidgetSchema>;
