import { Label, NormalizedTorrent } from '@ctrl/shared-torrent';

export type NormalizedTorrentListResponse = {
  /**
   * Available labels on all torrent clients
   */
  labels: Label[];

  /**
   * Feteched and normalized torrents of all download clients
   */
  torrents: ConcatenatedTorrentList[];

  /**
   * Indicated wether all requests were a success
   */
  allSuccess: boolean;

  /**
   * Missing download clients
   */
  missingDownloadClients: boolean;
};

type ConcatenatedTorrentList = {
  appId: string;
  torrents: NormalizedTorrent[];
};
