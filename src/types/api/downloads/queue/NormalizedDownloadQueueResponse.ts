import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { UsenetQueueItem } from '~/widgets/useNet/types';

export type NormalizedDownloadQueueResponse = {
  apps: NormalizedDownloadAppStat[];
  failedApps: string[];
};

export type NormalizedDownloadAppStat = {
  success: boolean;
  appId: string;
} & (TorrentTotalDownload | UsenetTotalDownloas);

export type TorrentTotalDownload = {
  type: 'torrent';
  torrents: NormalizedTorrent[];
  totalDownload: number;
  totalUpload: number;
};

export type UsenetTotalDownloas = {
  type: 'usenet';
  totalDownload: number;
  nzbs: UsenetQueueItem[];
};
