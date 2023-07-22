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
      Consola.error(`App ${input} not found`);
      throw new TRPCError({
        code: 'NOT_FOUND',
        cause: input,
        message: `App ${input} was not found`,
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
          return {
            state: getIsOk(app as AppType, error.response.status) ? 'online' : 'offline',
            status: error.response.status,
            statusText: error.response.statusText,
          };
        }

        if (error.code === 'ECONNABORTED') {
          Consola.error(`Ping timed out for app with id : ${input} (url: ${url})`);
          throw new TRPCError({
            code: 'TIMEOUT',
            cause: input,
            message: `Ping timed out`,
          });
        }

        Consola.error(`Unexpected response: ${error.message}`);
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          cause: input,
          message: `Unexpected response: ${error.message}`,
        });
      });
    return res;
  }),
});
