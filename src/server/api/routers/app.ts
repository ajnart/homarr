import { TRPCError } from '@trpc/server';
import axios, { AxiosError } from 'axios';
import Consola from 'consola';
import https from 'https';
import { z } from 'zod';
import { getConfig } from '~/tools/config/getConfig';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  ping: publicProcedure
    .input(
      z.object({
        id: z.string(),
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const agent = new https.Agent({ rejectUnauthorized: false });
      const config = getConfig(input.configName);
      const app = config.apps.find((app) => app.id === input.id);

      if (!app?.url) {
        Consola.error(`App ${input} not found`);
        throw new TRPCError({
          code: 'NOT_FOUND',
          cause: input,
          message: `App ${input.id} was not found`,
        });
      }
      const res = await axios
        .get(app.url, { httpsAgent: agent, timeout: 10000 })
        .then((response) => ({
          status: response.status,
          statusText: response.statusText,
          state: app.network.statusCodes?.includes(response.status.toString())
            ? 'online'
            : 'offline',
        }))
        .catch((error: AxiosError) => {
          if (error.response) {
            return {
              state: app.network.statusCodes?.includes(error.response.status.toString())
                ? 'online'
                : 'offline',
              status: error.response.status,
              statusText: error.response.statusText,
            };
          }

          if (error.code === 'ECONNABORTED') {
            Consola.error(
              `Ping timed out for app with id '${input.id}' in config '${input.configName}' -> url: ${app.url})`
            );
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
