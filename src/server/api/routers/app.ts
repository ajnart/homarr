import { TRPCError } from '@trpc/server';
import axios, { AxiosError } from 'axios';
import Consola from 'consola';
import https from 'https';
import { z } from 'zod';
import { isStatusOk } from '~/components/Dashboard/Tiles/Apps/AppPing';
import { getConfig } from '~/tools/config/getConfig';
import { AppType } from '~/types/app';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  pingAll: publicProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const agent = new https.Agent({ rejectUnauthorized: false });
      const config = getConfig(input.configName);
      const apps = config.apps.filter((app) => app.network.enabledStatusChecker);

      const results = await Promise.allSettled(
        apps.map(async (app) => {
          return await axios
            .get(app.url, { httpsAgent: agent, timeout: 2000 })
            .then(
              (response) =>
                ({
                  appId: app.id,
                  status: response.status,
                  statusText: response.statusText,
                  state: isStatusOk(app as AppType, response.status) ? 'online' : 'offline',
                }) satisfies PingResult
            )
            .catch((error: AxiosError) => {
              if (error.response) {
                return {
                  appId: app.id,
                  state: isStatusOk(app as AppType, error.response.status) ? 'online' : 'offline',
                  status: error.response.status,
                  statusText: error.response.statusText,
                } satisfies PingResult;
              }

              if (error.code === 'ECONNABORTED') {
                Consola.error(`Ping timed out for app with id : ${app.id} (url: ${app.url})`);
                return {
                  appId: app.id,
                  state: 'error',
                  status: 0,
                  statusText: 'Ping timed out',
                } satisfies PingResult;
              }

              Consola.error(`Unexpected response: ${error.message}`);
              return {
                appId: app.id,
                state: 'error',
                status: 0,
                statusText: error.message,
              } satisfies PingResult;
            });
        })
      );

      return results.map((result) => {
        if (result.status === 'rejected') {
          return result.reason;
        }
        return result.value;
      }) as PingResult[];
    }),
});

type PingResult = {
  appId: string;
  status: number;
  statusText: string;
  state: 'online' | 'offline' | 'error';
};
