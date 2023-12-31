import { TRPCError } from '@trpc/server';
import { AxiosError } from 'axios';
import Consola from 'consola';
import { z } from 'zod';
import { isStatusOk } from '~/components/Dashboard/Tiles/Apps/AppPing';
import { getConfig } from '~/tools/config/getConfig';
import { AppType } from '~/types/app';

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

      const res = await fetch(app.url, {
        method: 'GET',
        cache: 'force-cache',
        headers: {
          // Cache for 5 minutes
          'Cache-Control': 'max-age=300',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => ({
          status: response.status,
          statusText: response.statusText,
          state: isStatusOk(app as AppType, response.status) ? 'online' : 'offline',
        }))
        .catch((error: AxiosError) => {
          if (error.response) {
            return {
              state: isStatusOk(app as AppType, error.response.status) ? 'online' : 'offline',
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
