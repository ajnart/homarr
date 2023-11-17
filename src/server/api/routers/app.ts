import { TRPCError } from '@trpc/server';
import axios, { AxiosError } from 'axios';
import Consola from 'consola';
import https from 'https';
import { z } from 'zod';
import { getAppAsync } from '~/server/db/queries/app';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  ping: publicProcedure
    .input(
      z.object({
        id: z.string(),
        boardId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const agent = new https.Agent({ rejectUnauthorized: false });
      const appItem = await getAppAsync(input.boardId, input.id, ctx.session?.user);

      if (!appItem?.app) {
        Consola.error(`App ${input} not found`);
        throw new TRPCError({
          code: 'NOT_FOUND',
          cause: input,
          message: `App ${input.id} was not found`,
        });
      }
      const res = await axios
        .get(appItem.app.internalUrl, { httpsAgent: agent, timeout: 10000 })
        .then((response) => ({
          status: response.status,
          statusText: response.statusText,
          state: getNetworkState(appItem.app!.statusCodes, response.status),
        }))
        .catch((error: AxiosError) => {
          if (error.response) {
            return {
              state: getNetworkState(appItem.app!.statusCodes, error.response.status),
              status: error.response.status,
              statusText: error.response.statusText,
            };
          }

          if (error.code === 'ECONNABORTED') {
            Consola.error(
              `Ping timed out for app with id '${input.id}' in config '${input.boardId}' -> url: ${appItem.app?.internalUrl})`
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

function getNetworkState(statusCodes: { code: number }[], responseStatus: number) {
  return statusCodes.some((s) => s.code === responseStatus) ? 'online' : 'offline';
}
