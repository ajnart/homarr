import { TRPCError } from '@trpc/server';
import axios, { AxiosError } from 'axios';
import Consola from 'consola';
import { getCookie } from 'cookies-next';
import https from 'https';
import { z } from 'zod';
import { getIsOk } from '~/components/Dashboard/Tiles/Apps/AppPing';
import { getConfig } from '~/tools/config/getConfig';
import { AppType } from '~/types/app';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  ping: publicProcedure.input(z.string()).query(async ({ input }) => {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const configName = getCookie('config-name');
    const config = getConfig(configName?.toString() ?? 'default');
    const app = config.apps.find((app) => app.id === input);
    const url = app?.url;
    if (url === undefined || !app) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'App or url not found',
      });
    }
    const res = await axios
      .get(url, { httpsAgent: agent, timeout: 2000 })
      .then((response) => ({
        status: response.status,
        statusText: response.statusText,
      }))
      .catch((error: AxiosError) => {
        if (error.response) {
          if (getIsOk(app as AppType, error.response.status)) {
            return {
              state: 'offline',
              status: error.response.status,
              statusText: error.response.statusText,
            };
          }
        }
        if (error.code === 'ECONNABORTED') {
          throw new TRPCError({
            code: 'TIMEOUT',
            message: 'Request Timeout',
          });
        }

        Consola.error(`Unexpected response: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: app.id,
          message: error.message,
        });
      });
    return res;
  }),
});
