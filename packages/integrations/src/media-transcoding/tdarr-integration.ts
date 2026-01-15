import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { IMediaTranscodingIntegration } from "../interfaces/media-transcoding/media-transcoding-integration";
import type { TdarrQueue, TdarrStatistics, TdarrWorker } from "../interfaces/media-transcoding/media-transcoding-types";
import { getNodesResponseSchema, getStatisticsSchema, getStatusTableSchema } from "./tdarr-validation-schemas";

export class TdarrIntegration extends Integration implements IMediaTranscodingIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(this.url("/api/v2/is-server-alive"), {
      method: "POST",
      headers: {
        accept: "application/json",
        "X-Api-Key": super.hasSecretValue("apiKey") ? super.getSecretValue("apiKey") : "",
      },
    });

    if (!response.ok) return TestConnectionError.StatusResult(response);

    await response.json();
    return { success: true };
  }

  public async getStatisticsAsync(): Promise<TdarrStatistics> {
    const url = this.url("/api/v2/stats/get-pies");

    const headerParams = {
      accept: "application/json",
      "Content-Type": "application/json",
      ...(super.hasSecretValue("apiKey") ? { "X-Api-Key": super.getSecretValue("apiKey") } : {}),
    };

    const response = await fetchWithTrustedCertificatesAsync(url, {
      method: "POST",
      headers: headerParams,
      body: JSON.stringify({
        data: {
          libraryId: "", // empty string to get all libraries
        },
      }),
    });

    const statisticsData = await getStatisticsSchema.parseAsync(await response.json());

    return {
      libraryName: "All",
      totalFileCount: statisticsData.pieStats.totalFiles,
      totalTranscodeCount: statisticsData.pieStats.totalTranscodeCount,
      totalHealthCheckCount: statisticsData.pieStats.totalHealthCheckCount,
      // The Tdarr API only returns a category if there is at least one item in it
      failedTranscodeCount:
        statisticsData.pieStats.status.transcode.find((transcode) => transcode.name === "Transcode error")?.value ?? 0,
      failedHealthCheckCount:
        statisticsData.pieStats.status.healthcheck.find((healthcheck) => healthcheck.name === "Error")?.value ?? 0,
      stagedTranscodeCount:
        statisticsData.pieStats.status.transcode.find((transcode) => transcode.name === "Transcode success")?.value ??
        0,
      stagedHealthCheckCount:
        statisticsData.pieStats.status.healthcheck.find((healthcheck) => healthcheck.name === "Queued")?.value ?? 0,

      totalSavedSpace: statisticsData.pieStats.sizeDiff * 1_000_000_000, // sizeDiff is in GB, convert to bytes
      transcodeStatus: statisticsData.pieStats.status.transcode,
      healthCheckStatus: statisticsData.pieStats.status.healthcheck,
      videoCodecs: statisticsData.pieStats.video.codecs,
      videoContainers: statisticsData.pieStats.video.containers,
      videoResolutions: statisticsData.pieStats.video.resolutions,
      audioCodecs: statisticsData.pieStats.audio.codecs,
      audioContainers: statisticsData.pieStats.audio.containers,
    };
  }

  public async getWorkersAsync(): Promise<TdarrWorker[]> {
    const url = this.url("/api/v2/get-nodes");
    const headerParams = {
      "Content-Type": "application/json",
      ...(super.hasSecretValue("apiKey") ? { "X-Api-Key": super.getSecretValue("apiKey") } : {}),
    };
    const response = await fetchWithTrustedCertificatesAsync(url, {
      method: "GET",
      headers: headerParams,
    });

    const nodesData = await getNodesResponseSchema.parseAsync(await response.json());
    const workers = Object.values(nodesData).flatMap((node) => {
      return Object.values(node.workers);
    });

    return workers.map((worker) => ({
      id: worker._id,
      filePath: worker.file,
      fps: worker.fps,
      percentage: worker.percentage,
      ETA: worker.ETA,
      jobType: worker.job.type,
      status: worker.status,
      step: worker.lastPluginDetails?.number ?? "",
      originalSize: worker.originalfileSizeInGbytes * 1_000_000_000, // file_size is in GB, convert to bytes,
      estimatedSize: worker.estSize ? worker.estSize * 1_000_000_000 : null, // file_size is in GB, convert to bytes,
      outputSize: worker.outputFileSizeInGbytes ? worker.outputFileSizeInGbytes * 1_000_000_000 : null, // file_size is in GB, convert to bytes,
    }));
  }

  public async getQueueAsync(firstItemIndex: number, pageSize: number): Promise<TdarrQueue> {
    const transcodingQueue = await this.getTranscodingQueueAsync(firstItemIndex, pageSize);
    const healthChecks = await this.getHealthCheckDataAsync(firstItemIndex, pageSize, transcodingQueue.totalCount);

    const combinedArray = [...transcodingQueue.array, ...healthChecks.array].slice(0, pageSize);
    return {
      array: combinedArray,
      totalCount: transcodingQueue.totalCount + healthChecks.totalCount,
      startIndex: firstItemIndex,
      endIndex: firstItemIndex + combinedArray.length - 1,
    };
  }

  private async getTranscodingQueueAsync(firstItemIndex: number, pageSize: number) {
    const url = this.url("/api/v2/client/status-tables");
    const headerParams = {
      "Content-Type": "application/json",
      ...(super.hasSecretValue("apiKey") ? { "X-Api-Key": super.getSecretValue("apiKey") } : {}),
    };
    const response = await fetchWithTrustedCertificatesAsync(url, {
      method: "POST",
      headers: headerParams,
      body: JSON.stringify({
        data: {
          start: firstItemIndex,
          pageSize,
          filters: [],
          sorts: [],
          opts: { table: "table1" },
        },
      }),
    });
    const transcodesQueueData = await getStatusTableSchema.parseAsync(await response.json());

    return {
      array: transcodesQueueData.array.map((item) => ({
        id: item._id,
        healthCheck: item.HealthCheck,
        transcode: item.TranscodeDecisionMaker,
        filePath: item.file,
        fileSize: Math.floor(item.file_size * 1_000_000), // file_size is in MB, convert to bytes, floor because it returns as float
        container: item.container,
        codec: item.video_codec_name,
        resolution: item.video_resolution,
        type: "transcode" as const,
      })),
      totalCount: transcodesQueueData.totalCount,
      startIndex: firstItemIndex,
      endIndex: firstItemIndex + transcodesQueueData.array.length - 1,
    };
  }

  private async getHealthCheckDataAsync(firstItemIndex: number, pageSize: number, totalQueueCount: number) {
    const url = this.url("/api/v2/client/status-tables");
    const headerParams = {
      "Content-Type": "application/json",
      ...(super.hasSecretValue("apiKey") ? { "X-Api-Key": super.getSecretValue("apiKey") } : {}),
    };
    const response = await fetchWithTrustedCertificatesAsync(url, {
      method: "POST",
      headers: headerParams,
      body: JSON.stringify({
        data: {
          start: Math.max(firstItemIndex - totalQueueCount, 0),
          pageSize,
          filters: [],
          sorts: [],
          opts: {
            table: "table4",
          },
        },
      }),
    });

    const healthCheckData = await getStatusTableSchema.parseAsync(await response.json());

    return {
      array: healthCheckData.array.map((item) => ({
        id: item._id,
        healthCheck: item.HealthCheck,
        transcode: item.TranscodeDecisionMaker,
        filePath: item.file,
        fileSize: Math.floor(item.file_size * 1_000_000), // file_size is in MB, convert to bytes, floor because it returns as float
        container: item.container,
        codec: item.video_codec_name,
        resolution: item.video_resolution,
        type: "health-check" as const,
      })),
      totalCount: healthCheckData.totalCount,
    };
  }
}
