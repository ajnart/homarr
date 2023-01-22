import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { UsenetQueueItem } from '../../../../widgets/useNet/types';

export type NormalizedDownloadQueueResponse = {
  apps: NormalizedDownloadAppStat[];
};

export type NormalizedDownloadAppStat = {
  success: boolean;
  appId: string;
  totalDownload: number;
} & (TorrentTotalDownload | UsenetTotalDownloas);

export type TorrentTotalDownload = {
  type: 'torrent';
  torrents: NormalizedTorrent[];
  totalUpload: number;
};

export type UsenetTotalDownloas = {
  type: 'usenet';
  nzbs: UsenetQueueItem[];
};
