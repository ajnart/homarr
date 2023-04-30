import { z } from 'zod';
import axios from 'axios';
import https from 'https';
import Consola from 'consola';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const pingRouter = createTRPCRouter({
  url: publicProcedure
    .input(
      z.object({
        url: z.string().url(),
      })
    )
    .query(async ({ input }) => {
      const agent = new https.Agent({ rejectUnauthorized: false });
      return axios
        .get(input.url, { httpsAgent: agent, timeout: 2000 })
        .then((response) => ({
          statusCode: response.status,
          message: response.statusText,
        }))
        .catch((error) => {
          if (error.response) {
            Consola.error(`Unexpected response: ${error.response.data}`);
            return {
              statusCode: error.response.status as number,
              message: error.response.statusText as string,
            };
          }
          if (error.code === 'ECONNABORTED') {
            return {
              statusCode: 408,
              message: 'Request timeout',
            };
          }
          return {
            statusCode: 500,
            message: 'Server error',
          };
        });
    }),
});
