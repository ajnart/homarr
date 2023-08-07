import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { Client } from 'sabnzbd-api';
import { z } from 'zod';
import {
  NzbgetHistoryItem,
  NzbgetQueueItem,
  NzbgetStatus,
} from '~/server/api/routers/usenet/nzbget/types';
import { checkIntegrationsType, findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { UsenetHistoryItem, UsenetQueueItem } from '~/widgets/useNet/types';

import { createTRPCRouter, publicProcedure } from '../../trpc';
import { NzbgetClient } from './nzbget/nzbget-client';

export const usenetRouter = createTRPCRouter({
  info: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        appId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const app = config.apps.find((x) => x.id === input.appId);

      if (!app || !checkIntegrationsType(app.integration, ['nzbGet', 'sabnzbd'])) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `App with ID "${input.appId}" could not be found.`,
        });
      }

      if (app.integration.type === 'nzbGet') {
        const url = new URL(app.url);
        const options = {
          host: url.hostname,
          port: url.port || (url.protocol === 'https:' ? '443' : '80'),
          login: findAppProperty(app, 'username'),
          hash: findAppProperty(app, 'password'),
        };

        const nzbGet = NzbgetClient(options);

        const nzbgetStatus: NzbgetStatus = await new Promise((resolve, reject) => {
          nzbGet.status((err: any, result: NzbgetStatus) => {
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

      const apiKey = findAppProperty(app, 'apiKey');
      if (!apiKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `API Key for app "${app.name}" is missing`,
        });
      }

      const { origin } = new URL(app.url);

      const queue = await new Client(origin, apiKey).queue(0, -1);

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
        configName: z.string(),
        appId: z.string(),
        limit: z.number(),
        offset: z.number(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const app = config.apps.find((x) => x.id === input.appId);

      if (!app || !checkIntegrationsType(app.integration, ['nzbGet', 'sabnzbd'])) {
        throw new Error(`App with ID "${input.appId}" could not be found.`);
      }

      if (app.integration.type === 'nzbGet') {
        const url = new URL(app.url);
        const options = {
          host: url.hostname,
          port: url.port || (url.protocol === 'https:' ? '443' : '80'),
          login: findAppProperty(app, 'username'),
          hash: findAppProperty(app, 'password'),
        };

        const nzbGet = NzbgetClient(options);

        const nzbgetHistory: NzbgetHistoryItem[] = await new Promise((resolve, reject) => {
          nzbGet.history(false, (err: any, result: NzbgetHistoryItem[]) => {
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

      const { origin } = new URL(app.url);

      const apiKey = findAppProperty(app, 'apiKey');
      if (!apiKey) {
        throw new Error(`API Key for app "${app.name}" is missing`);
      }

      const history = await new Client(origin, apiKey).history(input.offset, input.limit);

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
        configName: z.string(),
        appId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const config = getConfig(input.configName);
      const app = config.apps.find((x) => x.id === input.appId);

      if (!app || !checkIntegrationsType(app.integration, ['nzbGet', 'sabnzbd'])) {
        throw new Error(`App with ID "${input.appId}" could not be found.`);
      }

      if (app.integration.type === 'nzbGet') {
        const url = new URL(app.url);
        const options = {
          host: url.hostname,
          port: url.port || (url.protocol === 'https:' ? '443' : '80'),
          login: findAppProperty(app, 'username'),
          hash: findAppProperty(app, 'password'),
        };

        const nzbGet = NzbgetClient(options);

        return new Promise((resolve, reject) => {
          nzbGet.pauseDownload(false, (err: any, result: any) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });
      }

      const apiKey = findAppProperty(app, 'apiKey');
      if (!apiKey) {
        throw new Error(`API Key for app "${app.name}" is missing`);
      }

      const { origin } = new URL(app.url);

      return new Client(origin, apiKey).queuePause();
    }),
  resume: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        appId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const config = getConfig(input.configName);

      const app = config.apps.find((x) => x.id === input.appId);

      if (!app || !checkIntegrationsType(app.integration, ['nzbGet', 'sabnzbd'])) {
        throw new Error(`App with ID "${input.appId}" could not be found.`);
      }

      if (app.integration.type === 'nzbGet') {
        const url = new URL(app.url);
        const options = {
          host: url.hostname,
          port: url.port || (url.protocol === 'https:' ? '443' : '80'),
          login: findAppProperty(app, 'username'),
          hash: findAppProperty(app, 'password'),
        };

        const nzbGet = NzbgetClient(options);

        return new Promise((resolve, reject) => {
          nzbGet.resumeDownload(false, (err: any, result: any) => {
            if (!err) {
              resolve(result);
            } else {
              reject(err);
            }
          });
        });
      }

      const apiKey = findAppProperty(app, 'apiKey');
      if (!apiKey) {
        throw new Error(`API Key for app "${app.name}" is missing`);
      }

      const { origin } = new URL(app.url);

      return new Client(origin, apiKey).queueResume();
    }),
  queue: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        appId: z.string(),
        limit: z.number(),
        offset: z.number(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const app = config.apps.find((x) => x.id === input.appId);

      if (!app || !checkIntegrationsType(app.integration, ['nzbGet', 'sabnzbd'])) {
        throw new Error(`App with ID "${input.appId}" could not be found.`);
      }

      if (app.integration.type === 'nzbGet') {
        const url = new URL(app.url);
        const options = {
          host: url.hostname,
          port: url.port || (url.protocol === 'https:' ? '443' : '80'),
          login: findAppProperty(app, 'username'),
          hash: findAppProperty(app, 'password'),
        };

        const nzbGet = NzbgetClient(options);

        const nzbgetQueue: NzbgetQueueItem[] = await new Promise((resolve, reject) => {
          nzbGet.listGroups((err: any, result: NzbgetQueueItem[]) => {
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
          nzbGet.status((err: any, result: NzbgetStatus) => {
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
          items: nzbgetItems,
          total: nzbgetItems.length,
        };
      }

      const apiKey = findAppProperty(app, 'apiKey');
      if (!apiKey) {
        throw new Error(`API Key for app "${app.name}" is missing`);
      }

      const { origin } = new URL(app.url);
      const queue = await new Client(origin, apiKey).queue(input.offset, input.limit);

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
});

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

export interface UsenetInfoResponse {
  paused: boolean;
  sizeLeft: number;
  speed: number;
  eta: number;
}
