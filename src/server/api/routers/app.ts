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

    const errorResponse = {
      state: 'offline',
      status: 500,
      statusText: 'Check logs for more informations',
    };

    const url = app?.url;
    if (url === undefined || !app) {
      Consola.error(`App ${input} not found`);
      return errorResponse;
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
          Consola.error(`Ping timeout for ${input}`);
          return errorResponse;
        }

        Consola.error(`Unexpected response: ${error.message}`);
        return errorResponse;
      });
    return res;
  }),
});
