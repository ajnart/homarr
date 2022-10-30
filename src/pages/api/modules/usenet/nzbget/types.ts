export interface NzbgetHistoryItem {
  NZBID: number;
  Kind: 'NZB' | 'URL' | 'DUP';
  NZBFilename: string;
  Name: string,
  URL: string,
  HistoryTime: number,
  DestDir: string,
  FinalDir: string,
  Category: string,
  FileSizeLo: number,
  FileSizeHi: number,
  FileSizeMB: number,
  FileCount: number,
  RemainingFileCount: number,
  MinPostTime: number,
  MaxPostTime: number,
  TotalArticles: number,
  SuccessArticles: number,
  FailedArticles: number,
  Health: number,
  DownloadedSizeLo: number,
  DownloadedSizeHi: number,
  DownloadedSizeMB: number,
  DownloadTimeSec: number,
  // TODO: Finish adding the rest of the properties here and move to a new folder for Nzbget types
}
