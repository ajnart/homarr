import type { TdarrQueue, TdarrStatistics, TdarrWorker } from "./media-transcoding-types";

export interface IMediaTranscodingIntegration {
  getStatisticsAsync(): Promise<TdarrStatistics>;
  getWorkersAsync(): Promise<TdarrWorker[]>;
  getQueueAsync(firstItemIndex: number, pageSize: number): Promise<TdarrQueue>;
}
