import path from "path";
import type { fetch as undiciFetch } from "undici";

import { ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import { Integration } from "../../base/integration";
import type { IntegrationTestingInput } from "../../base/integration";
import type { TestingResult } from "../../base/test-connection/test-connection-service";
import type { DownloadClientJobsAndStatus } from "../../interfaces/downloads/download-client-data";
import type { IDownloadClientIntegration } from "../../interfaces/downloads/download-client-integration";
import type { DownloadClientItem } from "../../interfaces/downloads/download-client-items";
import type { Aria2Download, Aria2GetClient } from "./aria2-types";

export class Aria2Integration extends Integration implements IDownloadClientIntegration {
  public async getClientJobsAndStatusAsync(input: { limit: number }): Promise<DownloadClientJobsAndStatus> {
    const client = this.getClient();
    const keys: (keyof Aria2Download)[] = [
      "bittorrent",
      "uploadLength",
      "uploadSpeed",
      "downloadSpeed",
      "totalLength",
      "completedLength",
      "files",
      "status",
      "gid",
    ];
    const [activeDownloads, waitingDownloads, stoppedDownloads, globalStats] = await Promise.all([
      client.tellActive(),
      client.tellWaiting(0, input.limit, keys),
      client.tellStopped(0, input.limit, keys),
      client.getGlobalStat(),
    ]);

    const downloads = [...activeDownloads, ...waitingDownloads, ...stoppedDownloads].slice(0, input.limit);
    const allPaused = downloads.every((download) => download.status === "paused");

    return {
      status: {
        types: ["torrent", "miscellaneous"],
        paused: allPaused,
        rates: {
          up: Number(globalStats.uploadSpeed),
          down: Number(globalStats.downloadSpeed),
        },
      },
      items: downloads.map((download, index) => {
        const totalSize = Number(download.totalLength);
        const completedSize = Number(download.completedLength);
        const progress = totalSize > 0 ? completedSize / totalSize : 0;

        const itemName = download.bittorrent?.info?.name ?? path.basename(download.files[0]?.path ?? "Unknown");

        return {
          index,
          id: download.gid,
          name: itemName,
          type: download.bittorrent ? "torrent" : "miscellaneous",
          size: totalSize,
          sent: Number(download.uploadLength),
          downSpeed: Number(download.downloadSpeed),
          upSpeed: Number(download.uploadSpeed),
          time: this.calculateEta(completedSize, totalSize, Number(download.downloadSpeed)),
          state: this.getState(download.status, Boolean(download.bittorrent)),
          category: [],
          progress,
        };
      }),
    } as DownloadClientJobsAndStatus;
  }
  public async pauseQueueAsync(): Promise<void> {
    const client = this.getClient();
    await client.pauseAll();
  }
  public async pauseItemAsync(item: DownloadClientItem): Promise<void> {
    const client = this.getClient();
    await client.pause(item.id);
  }
  public async resumeQueueAsync(): Promise<void> {
    const client = this.getClient();
    await client.unpauseAll();
  }
  public async resumeItemAsync(item: DownloadClientItem): Promise<void> {
    const client = this.getClient();
    await client.unpause(item.id);
  }
  public async deleteItemAsync(item: DownloadClientItem, fromDisk: boolean): Promise<void> {
    const client = this.getClient();
    // Note: Remove download file is not support by aria2, replace with forceremove

    if (item.state in ["downloading", "leeching", "paused"]) {
      await (fromDisk ? client.remove(item.id) : client.forceRemove(item.id));
    } else {
      await client.removeDownloadResult(item.id);
    }
  }

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const client = this.getClient(input.fetchAsync);
    await client.getVersion();
    return {
      success: true,
    };
  }

  private getClient(fetchAsync: typeof undiciFetch = fetchWithTrustedCertificatesAsync) {
    const url = this.url("/jsonrpc");

    return new Proxy(
      {},
      {
        get: (target, method: keyof Aria2GetClient) => {
          return async (...args: Parameters<Aria2GetClient[typeof method]>) => {
            let params = [...args];
            if (this.hasSecretValue("apiKey")) {
              params = [`token:${this.getSecretValue("apiKey")}`, ...params];
            }
            const body = JSON.stringify({
              jsonrpc: "2.0",
              id: btoa(["Homarr", Date.now().toString(), Math.random()].join(".")), // unique id per request
              method: `aria2.${method}`,
              params,
            });

            return await fetchAsync(url, { method: "POST", body })
              .then(async (response) => {
                const responseBody = (await response.json()) as { result: ReturnType<Aria2GetClient[typeof method]> };

                if (!response.ok) {
                  throw new ResponseError(response);
                }
                return responseBody.result;
              })
              .catch((error) => {
                if (error instanceof Error) {
                  throw error;
                }

                throw new Error("Error communicating with Aria2", {
                  cause: error,
                });
              });
          };
        },
      },
    ) as Aria2GetClient;
  }

  private getState(aria2Status: Aria2Download["status"], isTorrent: boolean): DownloadClientItem["state"] {
    return isTorrent ? this.getTorrentState(aria2Status) : this.getNonTorrentState(aria2Status);
  }
  private getNonTorrentState(aria2Status: Aria2Download["status"]): DownloadClientItem["state"] {
    switch (aria2Status) {
      case "active":
        return "downloading";
      case "waiting":
        return "queued";
      case "paused":
        return "paused";
      case "complete":
        return "completed";
      case "error":
        return "failed";
      case "removed":
      default:
        return "unknown";
    }
  }
  private getTorrentState(aria2Status: Aria2Download["status"]): DownloadClientItem["state"] {
    switch (aria2Status) {
      case "active":
        return "leeching";
      case "waiting":
        return "queued";
      case "paused":
        return "paused";
      case "complete":
        return "completed";
      case "error":
        return "failed";
      case "removed":
      default:
        return "unknown";
    }
  }
  private calculateEta(completed: number, total: number, speed: number): number {
    if (speed === 0 || completed >= total) return 0;
    return Math.floor((total - completed) / speed) * 1000; // Convert to milliseconds
  }
}
