import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import type { fetch as undiciFetch } from "undici";

import { ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import { Integration } from "../../base/integration";
import type { IntegrationTestingInput } from "../../base/integration";
import type { TestingResult } from "../../base/test-connection/test-connection-service";
import type { DownloadClientJobsAndStatus } from "../../interfaces/downloads/download-client-data";
import type { IDownloadClientIntegration } from "../../interfaces/downloads/download-client-integration";
import type { DownloadClientItem } from "../../interfaces/downloads/download-client-items";
import type { DownloadClientStatus } from "../../interfaces/downloads/download-client-status";
import { historySchema, queueSchema } from "./sabnzbd-schema";

dayjs.extend(duration);

export class SabnzbdIntegration extends Integration implements IDownloadClientIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    //This is the one call that uses the least amount of data while requiring the api key
    await this.sabNzbApiCallWithCustomFetchAsync(input.fetchAsync, "translate", { value: "ping" });
    return { success: true };
  }

  public async getClientJobsAndStatusAsync(input: { limit: number }): Promise<DownloadClientJobsAndStatus> {
    const type = "usenet";
    const { queue } = await queueSchema.parseAsync(
      await this.sabNzbApiCallAsync("queue", { limit: input.limit.toString() }),
    );
    const { history } = await historySchema.parseAsync(
      await this.sabNzbApiCallAsync("history", { limit: input.limit.toString() }),
    );
    const status: DownloadClientStatus = {
      paused: queue.paused,
      rates: { down: Math.floor(Number(queue.kbpersec) * 1024) }, //Actually rounded kiBps ()
      types: [type],
    };
    const items = queue.slots
      .map((slot): DownloadClientItem => {
        const state = SabnzbdIntegration.getUsenetQueueState(slot.status);
        const times = slot.timeleft.split(":").reverse();
        const time = dayjs
          .duration({
            seconds: Number(times[0] ?? 0),
            minutes: Number(times[1] ?? 0),
            hours: Number(times[2] ?? 0),
            days: Number(times[3] ?? 0),
          })
          .asMilliseconds();
        return {
          type,
          id: slot.nzo_id,
          index: slot.index,
          name: slot.filename,
          size: Math.ceil(parseFloat(slot.mb) * 1024 * 1024), //Actually rounded MiB
          downSpeed: slot.index > 0 ? 0 : status.rates.down,
          time,
          //added: 0, <- Only part from all integrations that is missing the timestamp (or from which it could be inferred)
          state,
          progress: parseFloat(slot.percentage) / 100,
          category: slot.cat,
        };
      })
      .concat(
        history.slots.map((slot, index): DownloadClientItem => {
          const state = SabnzbdIntegration.getUsenetHistoryState(slot.status);
          return {
            type,
            id: slot.nzo_id,
            index,
            name: slot.name,
            size: slot.bytes,
            time: slot.completed * 1000 - dayjs().valueOf(),
            added: (slot.completed - slot.download_time - slot.postproc_time) * 1000,
            state,
            progress: 1,
            category: slot.category,
          };
        }),
      )
      .slice(0, input.limit);
    return { status, items };
  }

  public async pauseQueueAsync() {
    await this.sabNzbApiCallAsync("pause");
  }

  public async pauseItemAsync({ id }: DownloadClientItem) {
    await this.sabNzbApiCallAsync("queue", { name: "pause", value: id });
  }

  public async resumeQueueAsync() {
    await this.sabNzbApiCallAsync("resume");
  }

  public async resumeItemAsync({ id }: DownloadClientItem): Promise<void> {
    await this.sabNzbApiCallAsync("queue", { name: "resume", value: id });
  }

  //Delete files prevented on completed files. https://github.com/sabnzbd/sabnzbd/issues/2754
  //Works on all other in downloading and post-processing.
  //Will stop working as soon as the finished files is moved to completed folder.
  public async deleteItemAsync({ id, progress }: DownloadClientItem, fromDisk: boolean): Promise<void> {
    await this.sabNzbApiCallAsync(progress !== 1 ? "queue" : "history", {
      name: "delete",
      archive: fromDisk ? "0" : "1",
      value: id,
      del_files: fromDisk ? "1" : "0",
    });
  }

  private async sabNzbApiCallAsync(mode: string, searchParams?: Record<string, string>): Promise<unknown> {
    return await this.sabNzbApiCallWithCustomFetchAsync(fetchWithTrustedCertificatesAsync, mode, searchParams);
  }
  private async sabNzbApiCallWithCustomFetchAsync(
    fetchAsync: typeof undiciFetch,
    mode: string,
    searchParams?: Record<string, string>,
  ): Promise<unknown> {
    const url = this.url("/api", {
      ...searchParams,
      output: "json",
      mode,
      apikey: this.getSecretValue("apiKey"),
    });

    return await fetchAsync(url)
      .then((response) => {
        if (!response.ok) {
          throw new ResponseError(response);
        }
        return response.json();
      })
      .catch((error) => {
        if (error instanceof Error) {
          throw error;
        }

        throw new Error("Error communicating with SABnzbd", {
          cause: error,
        });
      });
  }

  private static getUsenetQueueState(status: string): DownloadClientItem["state"] {
    switch (status) {
      case "Queued":
        return "queued";
      case "Paused":
        return "paused";
      default:
        return "downloading";
    }
  }

  private static getUsenetHistoryState(status: string): DownloadClientItem["state"] {
    switch (status) {
      case "Completed":
        return "completed";
      case "Failed":
        return "failed";
      default:
        return "processing";
    }
  }
}
