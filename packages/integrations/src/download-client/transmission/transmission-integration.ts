import { Transmission } from "@ctrl/transmission";
import dayjs from "dayjs";
import type { Dispatcher } from "undici";

import { createCertificateAgentAsync } from "@homarr/core/infrastructure/http";

import { HandleIntegrationErrors } from "../../base/errors/decorator";
import { integrationOFetchHttpErrorHandler } from "../../base/errors/http";
import { Integration } from "../../base/integration";
import type { IntegrationTestingInput } from "../../base/integration";
import type { TestingResult } from "../../base/test-connection/test-connection-service";
import type { DownloadClientJobsAndStatus } from "../../interfaces/downloads/download-client-data";
import type { IDownloadClientIntegration } from "../../interfaces/downloads/download-client-integration";
import type { DownloadClientItem } from "../../interfaces/downloads/download-client-items";
import type { DownloadClientStatus } from "../../interfaces/downloads/download-client-status";

@HandleIntegrationErrors([integrationOFetchHttpErrorHandler])
export class TransmissionIntegration extends Integration implements IDownloadClientIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const client = await this.getClientAsync(input.dispatcher);
    await client.getSession();
    return {
      success: true,
    };
  }

  public async getClientJobsAndStatusAsync(input: { limit: number }): Promise<DownloadClientJobsAndStatus> {
    const type = "torrent";
    const client = await this.getClientAsync();
    // Currently there is no way to limit the number of returned torrents
    const { torrents } = (await client.listTorrents()).arguments;
    const rates = torrents.reduce(
      ({ down, up }, { rateDownload, rateUpload }) => ({ down: down + rateDownload, up: up + rateUpload }),
      { down: 0, up: 0 },
    );
    const paused =
      torrents.find(({ status }) => TransmissionIntegration.getTorrentState(status) !== "paused") === undefined;
    const status: DownloadClientStatus = { paused, rates, types: [type] };
    const items = torrents
      .map((torrent): DownloadClientItem => {
        const state = TransmissionIntegration.getTorrentState(torrent.status);
        return {
          type,
          id: torrent.hashString,
          index: torrent.queuePosition,
          name: torrent.name,
          size: torrent.totalSize,
          sent: torrent.uploadedEver,
          received: torrent.downloadedEver,
          downSpeed: torrent.percentDone !== 1 ? torrent.rateDownload : undefined,
          upSpeed: torrent.rateUpload,
          time:
            torrent.percentDone === 1
              ? Math.min(torrent.doneDate * 1000 - dayjs().valueOf(), -1)
              : Math.max(torrent.eta * 1000, 0),
          added: torrent.addedDate * 1000,
          state,
          progress: torrent.percentDone,
          category: torrent.labels,
        };
      })
      .slice(0, input.limit);
    return { status, items };
  }

  public async pauseQueueAsync() {
    const client = await this.getClientAsync();
    const ids = (await client.listTorrents()).arguments.torrents.map(({ hashString }) => hashString);
    await client.pauseTorrent(ids);
  }

  public async pauseItemAsync({ id }: DownloadClientItem): Promise<void> {
    const client = await this.getClientAsync();
    await client.pauseTorrent(id);
  }

  public async resumeQueueAsync() {
    const client = await this.getClientAsync();
    const ids = (await client.listTorrents()).arguments.torrents.map(({ hashString }) => hashString);
    await client.resumeTorrent(ids);
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
    return new Transmission({
      baseUrl: this.url("/").toString(),
      username: this.getSecretValue("username"),
      password: this.getSecretValue("password"),
      dispatcher: dispatcher ?? (await createCertificateAgentAsync()),
    });
  }

  private static getTorrentState(status: number): DownloadClientItem["state"] {
    switch (status) {
      case 0:
        return "paused";
      case 1:
      case 3:
        return "stalled";
      case 2:
      case 4:
        return "leeching";
      case 5:
      case 6:
        return "seeding";
      default:
        return "unknown";
    }
  }
}
