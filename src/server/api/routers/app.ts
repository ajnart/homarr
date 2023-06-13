import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import https from 'https';
import Consola from 'consola';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  ping: publicProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .query(async ({ input }) => {
      const agent = new https.Agent({ rejectUnauthorized: false });
      const res = await axios
        .get(input.url, { httpsAgent: agent, timeout: 2000 })
        .then((response) => ({
          status: response.status,
          statusText: response.statusText,
        }))
        .catch((error: AxiosError) => {
          if (error.response) {
            Consola.warn(`Unexpected response: ${error.message}`);
            return {
              status: error.response.status,
              statusText: error.response.statusText,
            };
          }
          if (error.code === 'ECONNABORTED') {
            throw new TRPCError({
              code: 'TIMEOUT',
              message: 'Request Timeout',
            });
          }

          Consola.error(`Unexpected error: ${error.message}`);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal Server Error',
          });
        });
      return res;
    }),
});
