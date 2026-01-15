import type { IMediaTranscodingIntegration } from "../../interfaces/media-transcoding/media-transcoding-integration";
import type {
  TdarrQueue,
  TdarrStatistics,
  TdarrWorker,
} from "../../interfaces/media-transcoding/media-transcoding-types";

export class MediaTranscodingMockService implements IMediaTranscodingIntegration {
  public async getStatisticsAsync(): Promise<TdarrStatistics> {
    return await Promise.resolve({
      libraryName: "Mock Library",
      totalFileCount: 1000,
      totalTranscodeCount: 200,
      totalHealthCheckCount: 150,
      failedTranscodeCount: 10,
      failedHealthCheckCount: 5,
      stagedTranscodeCount: 20,
      stagedHealthCheckCount: 15,
      totalSavedSpace: 5000000,
      audioCodecs: [{ name: "AAC", value: 300 }],
      audioContainers: [{ name: "MP4", value: 200 }],
      videoCodecs: [{ name: "H.264", value: 400 }],
      videoContainers: [{ name: "MKV", value: 250 }],
      videoResolutions: [{ name: "1080p", value: 600 }],
      healthCheckStatus: [{ name: "Healthy", value: 100 }],
      transcodeStatus: [{ name: "Transcode success", value: 180 }],
    });
  }
  public async getWorkersAsync(): Promise<TdarrWorker[]> {
    return await Promise.resolve(
      Array.from({ length: 5 }, (_, index) => MediaTranscodingMockService.createWorker(index)),
    );
  }
  public async getQueueAsync(firstItemIndex: number, pageSize: number): Promise<TdarrQueue> {
    return await Promise.resolve({
      array: Array.from({ length: pageSize }, (_, index) => ({
        id: `item-${firstItemIndex + index}`,
        healthCheck: "Pending",
        transcode: "Pending",
        filePath: `/path/to/file-${firstItemIndex + index}.mkv`,
        fileSize: 1000000000 + (firstItemIndex + index) * 100000000, // in bytes
        container: "MKV",
        codec: "H.264",
        resolution: "1080p",
        type: "transcode",
      })),
      totalCount: 50,
      startIndex: firstItemIndex,
      endIndex: firstItemIndex + pageSize - 1,
    });
  }

  private static createWorker(index: number): TdarrWorker {
    return {
      id: `worker-${index}`,
      filePath: `/path/to/file-${index}.mkv`,
      fps: 24 + index,
      percentage: index * 20,
      ETA: `${30 - index * 5} minutes`,
      jobType: "Transcode",
      status: "In Progress",
      step: `Step ${index + 1}`,
      originalSize: 1000000000 + index * 100000000, // in bytes
      estimatedSize: 800000000 + index * 50000000, // in bytes
      outputSize: 750000000 + index * 40000000, // in bytes
    };
  }
}
