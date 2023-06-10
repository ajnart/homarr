import dayjs from 'dayjs';
import { Client } from 'sabnzbd-api';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { NzbgetStatus } from '~/server/api/routers/usenet/nzbget/types';
import { getConfig } from '~/tools/config/getConfig';
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

      if (!app || (app.integration?.type !== 'nzbGet' && app.integration?.type !== 'sabnzbd')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `App with ID "${input.appId}" could not be found.`,
        });
      }

      if (app.integration?.type === 'nzbGet') {
        const url = new URL(app.url);
        const options = {
          host: url.hostname,
          port: url.port || (url.protocol === 'https:' ? '443' : '80'),
          login: app.integration.properties.find((x) => x.field === 'username')?.value ?? undefined,
          hash: app.integration.properties.find((x) => x.field === 'password')?.value ?? undefined,
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

      const apiKey = app.integration.properties.find((x) => x.field === 'apiKey')?.value;
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
});

export interface UsenetInfoResponse {
  paused: boolean;
  sizeLeft: number;
  speed: number;
  eta: number;
}
