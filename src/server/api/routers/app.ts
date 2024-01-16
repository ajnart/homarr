import { TRPCError } from '@trpc/server';
import axios, { AxiosError } from 'axios';
import Consola from 'consola';
import * as https from 'https';
import { z } from 'zod';
import { isStatusOk } from '~/components/Dashboard/Tiles/Apps/AppPing';
import { getConfig } from '~/tools/config/getConfig';
import { AppType } from '~/types/app';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  ping: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/app/ping', tags: ['app'] } })
    .input(
      z.object({
        id: z.string(),
        configName: z.string(),
      })
    )
    .output(
      z.object({
        status: z.number(),
        statusText: z.string(),
        state: z.string(),
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

      const agent = new https.Agent({
        rejectUnauthorized: false,
        requestCert: false,
      });

      return await axios
        .get(app.url, {
          httpsAgent: agent,
          timeout: 12 * 1000, // 12 seconds
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
    }),
});
