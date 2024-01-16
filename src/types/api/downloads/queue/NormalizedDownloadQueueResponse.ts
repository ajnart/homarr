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
  torrents: {
    name: string;
    state: NormalizedTorrent['state'];
    totalSelected: number;
    totalPeers: number;
    totalSeeds: number;
    eta: number;
    progress: number;
    ratio: number;
    uploadSpeed: number;
    downloadSpeed: number;
    isCompleted: boolean;
    totalDownloaded: number;
    totalUploaded: number;
    label?: string;
    queuePosition: number;
    stateMessage: string;
    dateAdded: string;
  }[];
  totalDownload: number;
  totalUpload: number;
};

export type UsenetTotalDownloas = {
  type: 'usenet';
  totalDownload: number;
  nzbs: UsenetQueueItem[];
};
