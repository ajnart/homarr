import { QBittorrent } from "@ctrl/qbittorrent";
import dayjs from "dayjs";
import type { Dispatcher } from "undici";

import { createCertificateAgentAsync } from "@homarr/core/infrastructure/http";

import { HandleIntegrationErrors } from "../../base/errors/decorator";
import { integrationOFetchHttpErrorHandler } from "../../base/errors/http";
import { Integration } from "../../base/integration";
import type { IntegrationTestingInput } from "../../base/integration";
import { TestConnectionError } from "../../base/test-connection/test-connection-error";
import type { TestingResult } from "../../base/test-connection/test-connection-service";
import type { DownloadClientJobsAndStatus } from "../../interfaces/downloads/download-client-data";
import type { IDownloadClientIntegration } from "../../interfaces/downloads/download-client-integration";
import type { DownloadClientItem } from "../../interfaces/downloads/download-client-items";
import type { DownloadClientStatus } from "../../interfaces/downloads/download-client-status";

@HandleIntegrationErrors([integrationOFetchHttpErrorHandler])
export class QBitTorrentIntegration extends Integration implements IDownloadClientIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const client = await this.getClientAsync(input.dispatcher);
    const isSuccess = await client.login();
    if (!isSuccess) return TestConnectionError.UnauthorizedResult(401);

    return {
      success: true,
    };
  }

  public async getClientJobsAndStatusAsync(input: { limit: number }): Promise<DownloadClientJobsAndStatus> {
    const type = "torrent";
    const client = await this.getClientAsync();
    const torrents = await client.listTorrents({ limit: input.limit });
    const rates = torrents.reduce(
      ({ down, up }, { dlspeed, upspeed }) => ({ down: down + dlspeed, up: up + upspeed }),
      { down: 0, up: 0 },
    );
    const paused =
      torrents.find(({ state }) => QBitTorrentIntegration.getTorrentState(state) !== "paused") === undefined;
    const status: DownloadClientStatus = { paused, rates, types: [type] };
    const items = torrents.map((torrent): DownloadClientItem => {
      const state = QBitTorrentIntegration.getTorrentState(torrent.state);
      return {
        type,
        id: torrent.hash,
        index: torrent.priority,
        name: torrent.name,
        size: torrent.size,
        sent: torrent.uploaded,
        downSpeed: torrent.progress !== 1 ? torrent.dlspeed : undefined,
        upSpeed: torrent.upspeed,
        time:
          torrent.progress === 1
            ? Math.min(torrent.completion_on * 1000 - dayjs().valueOf(), -1)
            : torrent.eta === 8640000
              ? 0
              : Math.max(torrent.eta * 1000, 0),
        added: torrent.added_on * 1000,
        state,
        progress: torrent.progress,
        category: torrent.category,
      };
    });
    return { status, items };
  }

  public async pauseQueueAsync() {
    const client = await this.getClientAsync();
    await client.pauseTorrent("all");
  }

  public async pauseItemAsync({ id }: DownloadClientItem): Promise<void> {
    const client = await this.getClientAsync();
    await client.pauseTorrent(id);
  }

  public async resumeQueueAsync() {
    const client = await this.getClientAsync();
    await client.resumeTorrent("all");
  }

  public async resumeItemAsync({ id }: DownloadClientItem): Promise<void> {
    const client = await this.getClientAsync();
    await client.resumeTorrent(id);
  }

  public async deleteItemAsync({ id }: DownloadClientItem, fromDisk: boolean): Promise<void> {
    const client = await this.getClientAsync();
    await client.removeTorrent(id, fromDisk);
  }

  private async getClientAsync(dispatcher?: Dispatcher) {
    return new QBittorrent({
      baseUrl: this.url("/").toString(),
      username: this.getSecretValue("username"),
      password: this.getSecretValue("password"),
      dispatcher: dispatcher ?? (await createCertificateAgentAsync()),
    });
  }

  private static getTorrentState(state: string): DownloadClientItem["state"] {
    switch (state) {
      case "allocating":
      case "checkingDL":
      case "downloading":
      case "forcedDL":
      case "forcedMetaDL":
      case "metaDL":
      case "queuedDL":
      case "queuedForChecking":
        return "leeching";
      case "checkingUP":
      case "forcedUP":
      case "queuedUP":
      case "uploading":
      case "stalledUP":
        return "seeding";
      case "pausedDL":
      case "pausedUP":
        return "paused";
      case "stalledDL":
        return "stalled";
      case "error":
      case "checkingResumeData":
      case "missingFiles":
      case "moving":
      case "unknown":
      default:
        return "unknown";
    }
  }
}
