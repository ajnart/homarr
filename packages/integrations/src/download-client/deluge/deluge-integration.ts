import { Deluge } from "@ctrl/deluge";
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
export class DelugeIntegration extends Integration implements IDownloadClientIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const client = await this.getClientAsync(input.dispatcher);
    const isSuccess = await client.login();

    if (!isSuccess) {
      return TestConnectionError.UnauthorizedResult(401);
    }

    return {
      success: true,
    };
  }

  public async getClientJobsAndStatusAsync(input: { limit: number }): Promise<DownloadClientJobsAndStatus> {
    const type = "torrent";
    const client = await this.getClientAsync();
    // Currently there is no way to limit the number of returned torrents
    const {
      stats: { download_rate, upload_rate },
      torrents: rawTorrents,
    } = (await client.listTorrents(["completed_time"])).result;
    const torrents = Object.entries(rawTorrents).map(([id, torrent]) => ({
      ...(torrent as { completed_time: number } & typeof torrent),
      id,
    }));
    const paused = torrents.find(({ state }) => DelugeIntegration.getTorrentState(state) !== "paused") === undefined;
    const status: DownloadClientStatus = {
      paused,
      rates: {
        down: Math.floor(download_rate),
        up: Math.floor(upload_rate),
      },
      types: [type],
    };
    const items = torrents
      .map((torrent): DownloadClientItem => {
        const state = DelugeIntegration.getTorrentState(torrent.state);
        return {
          type,
          id: torrent.id,
          index: torrent.queue,
          name: torrent.name,
          size: torrent.total_wanted,
          sent: torrent.total_uploaded,
          downSpeed: torrent.progress !== 100 ? torrent.download_payload_rate : undefined,
          upSpeed: torrent.upload_payload_rate,
          time:
            torrent.progress === 100
              ? Math.min((torrent.completed_time - dayjs().unix()) * 1000, -1)
              : Math.max(torrent.eta * 1000, 0),
          added: torrent.time_added * 1000,
          state,
          progress: torrent.progress / 100,
          category: torrent.label,
        };
      })
      .slice(0, input.limit);
    return { status, items };
  }

  public async pauseQueueAsync() {
    const client = await this.getClientAsync();
    const store = (await client.listTorrents()).result.torrents;
    await Promise.all(
      Object.entries(store).map(async ([id]) => {
        await client.pauseTorrent(id);
      }),
    );
  }

  public async pauseItemAsync({ id }: DownloadClientItem): Promise<void> {
    const client = await this.getClientAsync();
    await client.pauseTorrent(id);
  }

  public async resumeQueueAsync() {
    const client = await this.getClientAsync();
    const store = (await client.listTorrents()).result.torrents;
    await Promise.all(
      Object.entries(store).map(async ([id]) => {
        await client.resumeTorrent(id);
      }),
    );
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
    return new Deluge({
      baseUrl: this.url("/").toString(),
      password: this.getSecretValue("password"),
      dispatcher: dispatcher ?? (await createCertificateAgentAsync()),
    });
  }

  private static getTorrentState(state: string): DownloadClientItem["state"] {
    switch (state) {
      case "Queued":
      case "Checking":
      case "Allocating":
      case "Downloading":
        return "leeching";
      case "Seeding":
        return "seeding";
      case "Paused":
        return "paused";
      case "Error":
      case "Moving":
      default:
        return "unknown";
    }
  }
}
