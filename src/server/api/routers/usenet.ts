import { TRPCError } from '@trpc/server';
import { Client as SabnzbdClient } from 'sabnzbd-api';
import { z } from 'zod';
import dayjs from 'dayjs';
import { NzbgetClient } from '~/pages/api/modules/usenet/nzbget/nzbget-client';
import { ClientApp, generateClientAppSchema, mergeClientAppIntoServerApp } from '../helpers/apps';
import { usenetIntegrationTypes } from '../helpers/integrations';
import { getSecretValue } from '../helpers/secrets';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { getConfigData } from './config';
import {
  NzbgetHistoryItem,
  NzbgetQueueItem,
  NzbgetStatus,
} from '~/pages/api/modules/usenet/nzbget/types';
import { UsenetHistoryItem, UsenetQueueItem } from '~/widgets/useNet/types';

export const usenetRouter = createTRPCRouter({
  info: publicProcedure
    .input(
      z.object({
        app: generateClientAppSchema(usenetIntegrationTypes),
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfigData(input.configName);

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to find specified configuration',
        });
      }

      const app = mergeClientAppIntoServerApp(input.app, config.apps);

      if (app.integration.type === 'nzbGet') {
        const client = constructNzbGetClient(app);
        const nzbgetStatus: NzbgetStatus = await new Promise((resolve, reject) => {
          client.status((err: any, result: NzbgetStatus) => {
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

        const bytesRemaining = nzbgetStatus.RemainingSizeMB * 1000000;
        const eta = bytesRemaining / nzbgetStatus.DownloadRate;
        return {
          paused: nzbgetStatus.DownloadPaused,
          sizeLeft: bytesRemaining,
          speed: nzbgetStatus.DownloadRate,
          eta,
        };
      }

      const client = constructSabnzbdClient(app);

      const queue = await client.queue(0, -1);

      const [hours, minutes, seconds] = queue.timeleft.split(':');
      const eta = dayjs.duration({
        hour: parseInt(hours, 10),
        minutes: parseInt(minutes, 10),
        seconds: parseInt(seconds, 10),
      } as any);

      return {
        paused: queue.paused,
        sizeLeft: parseFloat(queue.mbleft) * 1024 * 1024,
        speed: parseFloat(queue.kbpersec) * 1000,
        eta: eta.asSeconds(),
      };
    }),
  history: publicProcedure
    .input(
      z.object({
        app: generateClientAppSchema(usenetIntegrationTypes),
        configName: z.string(),
        offset: z.number(),
        limit: z.number(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfigData(input.configName);

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to find specified configuration',
        });
      }

      const app = mergeClientAppIntoServerApp(input.app, config.apps);

      if (app.integration.type === 'nzbGet') {
        const client = constructNzbGetClient(app);

        const nzbgetHistory: NzbgetHistoryItem[] = await new Promise((resolve, reject) => {
          client.history(false, (err: any, result: NzbgetHistoryItem[]) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });

        if (!nzbgetHistory) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while getting NZBGet history',
          });
        }

        const nzbgetItems: UsenetHistoryItem[] = nzbgetHistory.map((item: NzbgetHistoryItem) => ({
          id: item.NZBID.toString(),
          name: item.Name,
          // Convert from MB to bytes
          size: item.DownloadedSizeMB * 1000000,
          time: item.DownloadTimeSec,
        }));

        return {
          items: nzbgetItems,
          total: nzbgetItems.length,
        };
      }

      const client = constructSabnzbdClient(app);
      const history = await client.history(input.offset, input.limit);

      const items: UsenetHistoryItem[] = history.slots.map((slot) => ({
        id: slot.nzo_id,
        name: slot.name,
        size: slot.bytes,
        time: slot.download_time,
      }));

      return {
        items,
        total: history.noofslots,
      };
    }),
  pause: publicProcedure
    .input(
      z.object({
        app: generateClientAppSchema(usenetIntegrationTypes),
        configName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const config = getConfigData(input.configName);

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to find specified configuration',
        });
      }

      const app = mergeClientAppIntoServerApp(input.app, config.apps);

      if (app.integration.type === 'nzbGet') {
        const client = constructNzbGetClient(app);
        const result = await new Promise((resolve, reject) => {
          client.pauseDownload(false, (err: any, result: any) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });
        return result;
      }

      const client = constructSabnzbdClient(app);
      const result = await client.queuePause();
      return result;
    }),
  queue: publicProcedure
    .input(
      z.object({
        app: generateClientAppSchema(usenetIntegrationTypes),
        configName: z.string(),
        offset: z.number(),
        limit: z.number(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfigData(input.configName);

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to find specified configuration',
        });
      }

      const app = mergeClientAppIntoServerApp(input.app, config.apps);

      if (app.integration.type === 'nzbGet') {
        const client = constructNzbGetClient(app);
        const nzbgetQueue: NzbgetQueueItem[] = await new Promise((resolve, reject) => {
          client.listGroups((err: any, result: NzbgetQueueItem[]) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });

        if (!nzbgetQueue) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error while getting NZBGet queue',
          });
        }

        const nzbgetStatus: NzbgetStatus = await new Promise((resolve, reject) => {
          client.status((err: any, result: NzbgetStatus) => {
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
          items: nzbgetItems,
          total: nzbgetItems.length,
        };
      }

      const client = constructSabnzbdClient(app);
      const queue = await client.queue(input.offset, input.limit);

      const items: UsenetQueueItem[] = queue.slots.map((slot) => {
        const [hours, minutes, seconds] = slot.timeleft.split(':');
        const eta = dayjs.duration({
          hour: parseInt(hours, 10),
          minutes: parseInt(minutes, 10),
          seconds: parseInt(seconds, 10),
        } as any);

        return {
          id: slot.nzo_id,
          eta: eta.asSeconds(),
          name: slot.filename,
          progress: parseFloat(slot.percentage),
          size: parseFloat(slot.mb) * 1000 * 1000,
          state: slot.status.toLowerCase() as any,
        };
      });

      return {
        items,
        total: queue.noofslots,
      };
    }),
  resume: publicProcedure
    .input(
      z.object({
        app: generateClientAppSchema(usenetIntegrationTypes),
        configName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const config = getConfigData(input.configName);

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to find specified configuration',
        });
      }

      const app = mergeClientAppIntoServerApp(input.app, config.apps);

      if (app.integration.type === 'nzbGet') {
        const client = constructNzbGetClient(app);
        const result = await new Promise((resolve, reject) => {
          client.resumeDownload(false, (err: any, result: any) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });
        return result;
      }

      const client = constructSabnzbdClient(app);

      const result = await client.queueResume();
      return result;
    }),
});

const constructNzbGetClient = (app: ClientApp) => {
  const url = new URL(app.url);
  const options = {
    host: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    login: getSecretValue(app.integration.properties, 'username'),
    hash: getSecretValue(app.integration.properties, 'password'),
  };

  return NzbgetClient(options);
};

const constructSabnzbdClient = (app: ClientApp) => {
  const apiKey = getSecretValue(app.integration.properties, 'apiKey');
  if (!apiKey) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `API key for app "${app.name}" is missing`,
    });
  }

  const { origin } = new URL(app.url);

  return new SabnzbdClient(origin, apiKey);
};

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
