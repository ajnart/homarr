import { TRPCError } from '@trpc/server';
import NZBGet from 'nzbget-api';
import { z } from 'zod';
import { getSecret } from '~/server/db/queries/integrations';
import { WidgetIntegration } from '~/server/db/queries/widget';

import { NzbgetHistoryItem, NzbgetQueueItem, NzbgetStatus } from '../nzbget/types';
import {
  UsenetClient,
  UsenetHistory,
  UsenetHistoryItem,
  UsenetInfo,
  UsenetPaginationOptions,
  UsenetQueue,
  UsenetQueueItem,
} from './useNetClient';

const clientOptionsSchema = z.object({
  host: z.string(),
  port: z.string(),
  username: z.string(),
  password: z.string(),
});

export class NzbgetUsenetClient implements UsenetClient {
  private client: any;

  constructor(integration: WidgetIntegration) {
    const url = new URL(integration.url);
    const options = clientOptionsSchema.safeParse({
      host: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
      login: getSecret(integration, 'username'),
      hash: getSecret(integration, 'password'),
    });
    if (!options.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Invalid nzbget client options',
      });
    }
    this.client = NZBGet(options.data);
  }

  async info(): Promise<UsenetInfo> {
    const nzbgetStatus: NzbgetStatus = await new Promise((resolve, reject) => {
      this.client.status((err: any, result: NzbgetStatus) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });

    if (!nzbgetStatus) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while getting NZBGet status',
      });
    }

    const bytesRemaining = nzbgetStatus.RemainingSizeMB * 1000000;
    const eta = bytesRemaining / nzbgetStatus.DownloadRate;
    return {
      paused: nzbgetStatus.DownloadPaused,
      sizeLeft: bytesRemaining,
      speed: nzbgetStatus.DownloadRate,
      eta,
    };
  }

  async history(options: UsenetPaginationOptions): Promise<UsenetHistory> {
    const nzbgetHistory: NzbgetHistoryItem[] = await new Promise((resolve, reject) => {
      this.client.history(false, (err: any, result: NzbgetHistoryItem[]) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });

    if (!nzbgetHistory) {
      throw new Error('Error while getting NZBGet history');
    }

    const nzbgetItems: UsenetHistoryItem[] = nzbgetHistory.map((item) => ({
      id: item.NZBID.toString(),
      name: item.Name,
      // Convert from MB to bytes
      size: item.DownloadedSizeMB * 1000000,
      time: item.DownloadTimeSec,
    }));

    return {
      items: nzbgetItems.slice(options.offset, options.offset + options.limit),
      total: nzbgetItems.length,
    };
  }

  async queue(options: UsenetPaginationOptions): Promise<UsenetQueue> {
    const nzbgetQueue: NzbgetQueueItem[] = await new Promise((resolve, reject) => {
      this.client.listGroups((err: any, result: NzbgetQueueItem[]) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });

    if (!nzbgetQueue) {
      throw new Error('Error while getting NZBGet queue');
    }

    const nzbgetStatus: NzbgetStatus = await new Promise((resolve, reject) => {
      this.client.status((err: any, result: NzbgetStatus) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });

    if (!nzbgetStatus) {
      throw new Error('Error while getting NZBGet status');
    }

    const nzbgetItems: UsenetQueueItem[] = nzbgetQueue.map((item: NzbgetQueueItem) => ({
      id: item.NZBID.toString(),
      name: item.NZBName,
      progress: (item.DownloadedSizeMB / item.FileSizeMB) * 100,
      eta: (item.RemainingSizeMB * 1000000) / nzbgetStatus.DownloadRate,
      // Multiple MB to get bytes
      size: item.FileSizeMB * 1000 * 1000,
      state: getNzbgetState(item.Status),
    }));

    return {
      items: nzbgetItems.slice(options.offset, options.offset + options.limit),
      total: nzbgetItems.length,
    };
  }

  pause(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.pauseDownload(false, (err: any, result: any) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }

  resume(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.resumeDownload(false, (err: any, result: any) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }
}

function getNzbgetState(status: string) {
  switch (status) {
    case 'QUEUED':
      return 'queued';
    case 'PAUSED ':
      return 'paused';
    default:
      return 'downloading';
  }
}
