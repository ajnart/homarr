export interface Aria2GetClient {
  getVersion: Aria2VoidFunc<Aria2GetVersion>;
  getGlobalStat: Aria2VoidFunc<Aria2GetGlobalStat>;

  tellActive: Aria2VoidFunc<Aria2Download[]>;
  tellWaiting: Aria2VoidFunc<Aria2Download[], Aria2TellStatusListParams>;
  tellStopped: Aria2VoidFunc<Aria2Download[], Aria2TellStatusListParams>;
  tellStatus: Aria2GidFunc<Aria2Download, Aria2TellStatusListParams>;

  pause: Aria2GidFunc<AriaGID>;
  pauseAll: Aria2VoidFunc<"OK">;
  unpause: Aria2GidFunc<AriaGID>;
  unpauseAll: Aria2VoidFunc<"OK">;
  remove: Aria2GidFunc<AriaGID>;
  forceRemove: Aria2GidFunc<AriaGID>;
  removeDownloadResult: Aria2GidFunc<"OK">;
}
type AriaGID = string;

type Aria2GidFunc<R = void, T extends unknown[] = []> = (gid: string, ...args: T) => Promise<R>;
type Aria2VoidFunc<R = void, T extends unknown[] = []> = (...args: T) => Promise<R>;

type Aria2TellStatusListParams = [offset: number, num: number, keys?: [keyof Aria2Download] | (keyof Aria2Download)[]];

export interface Aria2GetVersion {
  enabledFeatures: string[];
  version: string;
}
export interface Aria2GetGlobalStat {
  downloadSpeed: string;
  uploadSpeed: string;
  numActive: string;
  numWaiting: string;
  numStopped: string;
  numStoppedTotal: string;
}
export interface Aria2Download {
  gid: AriaGID;
  status: "active" | "waiting" | "paused" | "error" | "complete" | "removed";
  totalLength: string;
  completedLength: string;
  uploadLength: string;
  bitfield: string;
  downloadSpeed: string;
  uploadSpeed: string;
  infoHash?: string;
  numSeeders?: string;
  seeder?: "true" | "false";
  pieceLength: string;
  numPieces: string;
  connections: string;
  errorCode?: string;
  errorMessage?: string;
  followedBy?: AriaGID[];
  following?: AriaGID;
  belongsTo?: AriaGID;
  dir: string;
  files: {
    index: number;
    path: string;
    length: string;
    completedLength: string;
    selected: "true" | "false";
    uris: {
      status: "waiting" | "used";
      uri: string;
    }[];
  }[];
  bittorrent?: {
    announceList: string[];
    comment?: string | { "utf-8": string };
    creationDate?: number;
    mode?: "single" | "multi";
    info?: {
      name: string | { "utf-8": string };
    };
    verifiedLength?: number;
    verifyIntegrityPending?: boolean;
  };
}
