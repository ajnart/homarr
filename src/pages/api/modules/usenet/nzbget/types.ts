export interface NzbgetHistoryItem {
  NZBID: number;
  Kind: 'NZB' | 'URL' | 'DUP';
  NZBFilename: string;
  Name: string;
  URL: string;
  HistoryTime: number;
  DestDir: string;
  FinalDir: string;
  Category: string;
  FileSizeLo: number;
  FileSizeHi: number;
  FileSizeMB: number;
  FileCount: number;
  RemainingFileCount: number;
  MinPostTime: number;
  MaxPostTime: number;
  TotalArticles: number;
  SuccessArticles: number;
  FailedArticles: number;
  Health: number;
  DownloadedSizeLo: number;
  DownloadedSizeHi: number;
  DownloadedSizeMB: number;
  DownloadTimeSec: number;
  PostTotalTimeSec: number;
  ParTimeSec: number;
  RepairTimeSec: number;
  UnpackTimeSec: number;
  MessageCount: number;
  DupeKey: string;
  DupeScore: number;
  DupeMode: 'SCORE' | 'ALL' | 'FORCE';
  Status: string;
  ParStatus: 'NONE' | 'FAILURE' | 'REPAIR_POSSIBLE' | 'SUCCESS' | 'MANUAL';
  ExParStatus: 'RECIPIENT' | 'DONOR';
  UnpackStatus: 'NONE' | 'FAILURE' | 'SPACE' | 'PASSWORD' | 'SUCCESS';
  UrlStatus: 'NONE' | 'SUCCESS' | 'FAILURE' | 'SCAN_SKIPPED' | 'SCAN_FAILURE';
  ScriptStatus: 'NONE' | 'FAILURE' | 'SUCCESS';
  ScriptStatuses: [];
  MoveStatus: 'NONE' | 'SUCCESS' | 'FAILURE';
  DeleteStatus: 'NONE' | 'MANUAL' | 'HEALTH' | 'DUPE' | 'BAD' | 'SCAN' | 'COPY';
  MarkStatus: 'NONE' | 'GOOD' | 'BAD';
  ExtraParBlocks: number;
  Parameters: [];
  ServerStats: [];
}

export interface NzbgetQueueItem {
  NZBID: number;
  NZBFilename: string;
  NZBName: string;
  Kind: 'NZB' | 'URL';
  URL: string;
  DestDir: string;
  FinalDir: string;
  Category: string;
  FileSizeLo: number;
  FileSizeHi: number;
  FileSizeMB: number;
  RemainingSizeLo: number;
  RemainingSizeHi: number;
  RemainingSizeMB: number;
  PausedSizeLo: number;
  PausedSizeHi: number;
  PausedSizeMB: number;
  FileCount: number;
  RemainingFileCount: number;
  RemainingParCount: number;
  MinPostTime: number;
  MaxPostTime: number;
  MaxPriority: number;
  ActiveDownloads: number;
  Status:
    | 'QUEUED'
    | 'PAUSED'
    | 'DOWNLOADING'
    | 'FETCHING'
    | 'PP_QUEUED'
    | 'LOADING_PARS'
    | 'VERIFYING_SOURCES'
    | 'REPAIRING'
    | 'VERIFYING_REPAIRED'
    | 'RENAMING'
    | 'UNPACKING'
    | 'MOVING'
    | 'EXECUTING_SCRIPT'
    | 'PP_FINISHED';
  TotalArticles: number;
  SuccessArticles: number;
  FailedArticles: number;
  Health: number;
  CriticalHealth: number;
  DownloadedSizeLo: number;
  DownloadedSizeHi: number;
  DownloadedSizeMB: number;
  DownloadTimeSec: number;
  MessageCount: number;
  DupeKey: string;
  DupeScore: number;
  DupeMode: string;
  Parameters: [];
  ServerStats: [];
  PostInfoText: string;
  PostStageProgress: number;
  PostTotalTimeSec: number;
  PostStageTimeSec: number;
}

export interface NzbgetStatus {
  RemainingSizeLo: number;
  RemainingSizeHi: number;
  RemainingSizeMB: number;
  ForcedSizeLo: number;
  ForcedSizeHi: number;
  ForcedSizeMB: number;
  DownloadedSizeLo: number;
  DownloadedSizeHi: number;
  DownloadedSizeMB: number;
  ArticleCacheLo: number;
  ArticleCacheHi: number;
  ArticleCacheMB: number;
  DownloadRate: number;
  AverageDownloadRate: number;
  DownloadLimit: number;
  ThreadCount: number;
  PostJobCount: number;
  UrlCount: number;
  UpTimeSec: number;
  DownloadTimeSec: number;
  ServerStandBy: boolean;
  DownloadPaused: boolean;
  PostPaused: boolean;
  ScanPaused: boolean;
  ServerTime: number;
  ResumeTime: number;
  FeedActive: boolean;
  FreeDiskSpaceLo: number;
  FreeDiskSpaceHi: number;
  FreeDiskSpaceMB: number;
  NewsServers: [];
}

export interface NzbgetClientOptions {
  host: string;
  port: string;
  login: string | undefined;
  hash: string | undefined;
}
