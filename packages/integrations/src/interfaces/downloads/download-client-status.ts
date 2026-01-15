import type { Integration } from "@homarr/db/schema";

export interface DownloadClientStatus {
  /** If client is considered paused */
  paused: boolean;
  /** Download/Upload speeds for the client */
  rates: {
    down: number;
    up?: number;
  };
  types: ("usenet" | "torrent" | "miscellaneous")[];
}
export interface ExtendedClientStatus {
  integration: Pick<Integration, "id" | "name" | "kind"> & { updatedAt: Date };
  interact: boolean;
  status?: {
    /** To derive from current items */
    totalDown?: number;
    /** To derive from current items */
    totalUp?: number;
    ratio?: number;
  } & DownloadClientStatus;
}
