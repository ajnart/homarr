export interface NzbGetClient {
  version: () => string;
  status: () => NzbGetStatus;
  listgroups: () => NzbGetGroup[];
  history: () => NzbGetHistory[];
  pausedownload: () => void;
  resumedownload: () => void;
  editqueue: (Command: string, Param: string, IDs: number[]) => void;
  listfiles: (IDFrom: number, IDTo: number, NZBID: number) => { ID: number }[];
}

interface NzbGetStatus {
  DownloadPaused: boolean;
  DownloadRate: number;
}

interface NzbGetGroup {
  Status: string;
  NZBID: number;
  MaxPriority: number;
  NZBName: string;
  FileSizeLo: number;
  FileSizeHi: number;
  ActiveDownloads: number;
  RemainingSizeLo: number;
  RemainingSizeHi: number;
  DownloadTimeSec: number;
  Category: string;
  DownloadedSizeMB: number;
  FileSizeMB: number;
}

interface NzbGetHistory {
  ScriptStatus: string;
  NZBID: number;
  Name: string;
  FileSizeLo: number;
  FileSizeHi: number;
  HistoryTime: number;
  DownloadTimeSec: number;
  Category: string;
}
