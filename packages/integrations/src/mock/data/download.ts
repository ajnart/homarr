import type { DownloadClientJobsAndStatus } from "../../interfaces/downloads/download-client-data";
import type { IDownloadClientIntegration } from "../../interfaces/downloads/download-client-integration";
import type { DownloadClientItem } from "../../interfaces/downloads/download-client-items";

export class DownloadClientMockService implements IDownloadClientIntegration {
  public async getClientJobsAndStatusAsync(input: { limit: number }): Promise<DownloadClientJobsAndStatus> {
    return await Promise.resolve({
      status: {
        paused: Math.random() < 0.5,
        rates: {
          down: Math.floor(Math.random() * 5000),
          up: Math.floor(Math.random() * 5000),
        },
        types: ["torrent", "usenet"],
      },
      items: Array.from({ length: 20 }, (_, index) => DownloadClientMockService.createItem(index)).slice(
        0,
        input.limit,
      ),
    });
  }

  public async pauseQueueAsync(): Promise<void> {
    return await Promise.resolve();
  }

  public async pauseItemAsync(_item: DownloadClientItem): Promise<void> {
    return await Promise.resolve();
  }

  public async resumeQueueAsync(): Promise<void> {
    return Promise.resolve();
  }

  public async resumeItemAsync(_item: DownloadClientItem): Promise<void> {
    return await Promise.resolve();
  }

  public async deleteItemAsync(_item: DownloadClientItem, _fromDisk: boolean): Promise<void> {
    return await Promise.resolve();
  }

  private static createItem(index: number): DownloadClientItem {
    const progress = Math.random() < 0.5 ? Math.random() : 1;
    return {
      id: `item-${index}`,
      index,
      name: `Item ${index}`,
      type: Math.random() > 0.5 ? "torrent" : "usenet",
      progress,
      size: Math.floor(Math.random() * 10000) + 1,
      downSpeed: Math.floor(Math.random() * 5000),
      upSpeed: Math.floor(Math.random() * 5000),
      state: progress >= 1 ? "completed" : "downloading",
      time: 0,
    };
  }
}
