import { z } from "zod/v4";

import type { Integration } from "@homarr/db/schema";

const usenetQueueState = ["downloading", "queued", "paused"] as const;
const usenetHistoryState = ["completed", "failed", "processing"] as const;
const torrentState = ["leeching", "stalled", "paused", "seeding"] as const;

/**
 * DownloadClientItem
 * Description:
 * Normalized interface for downloading clients for Usenet and
 * Torrents alike, using common properties and few extra optionals
 * from each.
 */
export const downloadClientItemSchema = z.object({
  /** Unique Identifier provided by client */
  id: z.string(),
  /** Position in queue */
  index: z.number(),
  /** Filename */
  name: z.string(),
  /** Download Client identifier */
  type: z.enum(["torrent", "usenet", "miscellaneous"]),
  /** Item size in Bytes */
  size: z.number(),
  /** Total uploaded in Bytes, only required for Torrent items */
  sent: z.number().optional(),
  /** Total downloaded in Bytes, only required for Torrent items */
  received: z.number().optional(),
  /** Download speed in Bytes/s, only required if not complete
   *  (Says 0 only if it should be downloading but isn't) */
  downSpeed: z.number().optional(),
  /** Upload speed in Bytes/s, only required for Torrent items */
  upSpeed: z.number().optional(),
  /** Positive = eta (until completion, 0 meaning infinite), Negative = time since completion, in milliseconds*/
  time: z.number(),
  /** Unix timestamp in milliseconds when the item was added to the client */
  added: z.number().optional(),
  /** Status message, mostly as information to display and not for logic */
  state: z.enum(["unknown", ...usenetQueueState, ...usenetHistoryState, ...torrentState]),
  /** Progress expressed between 0 and 1, can infer completion from progress === 1 */
  progress: z.number().min(0).max(1),
  /** Category given to the item */
  category: z.string().or(z.array(z.string())).optional(),
});

export type DownloadClientItem = z.infer<typeof downloadClientItemSchema>;

export type ExtendedDownloadClientItem = {
  integration: Pick<Integration, "id" | "name" | "kind">;
  received: number;
  ratio?: number;
  actions?: {
    resume: () => void;
    pause: () => void;
    delete: ({ fromDisk }: { fromDisk: boolean }) => void;
  };
} & DownloadClientItem;
