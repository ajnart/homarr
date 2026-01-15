import type { DownloadClientJobsAndStatus } from "./download-client-data";
import type { DownloadClientItem } from "./download-client-items";

export interface IDownloadClientIntegration {
  /** Get download client's status and list of all of it's items */
  getClientJobsAndStatusAsync(input: { limit: number }): Promise<DownloadClientJobsAndStatus>;
  /** Pauses the client or all of it's items */
  pauseQueueAsync(): Promise<void>;
  /** Pause a single item using it's ID */
  pauseItemAsync(item: DownloadClientItem): Promise<void>;
  /** Resumes the client or all of it's items */
  resumeQueueAsync(): Promise<void>;
  /** Resume a single item using it's ID */
  resumeItemAsync(item: DownloadClientItem): Promise<void>;
  /** Delete an entry on the client or a file from disk */
  deleteItemAsync(item: DownloadClientItem, fromDisk: boolean): Promise<void>;
}
