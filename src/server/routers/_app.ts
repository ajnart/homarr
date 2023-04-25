/**
 * This file contains the root router of your tRPC-backend
 */
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import https from 'https';
import { getCookie } from 'cookies-next';
import { TRPCError } from '@trpc/server';
import Consola from 'consola';
import { procedure, router } from '../trpc';
import { getConfig } from '~/tools/config/getConfig';
import { AppType } from '~/types/app';

const getIsOk = (app: AppType, status: number) => {
  if (app.network.okStatus === undefined || app.network.statusCodes.length >= 1) {
    Consola.debug('Using new status codes');
    return app.network.statusCodes.includes(status.toString());
  }
  Consola.warn('Using deprecated okStatus');
  return app.network.okStatus.includes(status);
};

export const appRouter = router({
  // Ping should take a Query param for URL
  ping: procedure.input(z.string()).query(async ({ input }) => {
    const configName = getCookie('config-name');
    const config = getConfig(configName?.toString() ?? 'default');
    // Find the internal url of the service with the ID passed as input
    const app = config.apps.find((app) => app.id === input);
    const url = app?.url;
    if (!url) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Could not find service with ID ${input}`,
      });
    }
    const agent = new https.Agent({ rejectUnauthorized: false });
    const data = await axios
      .get(url as string, { httpsAgent: agent, timeout: 5000 })
      .catch((error: AxiosError) => {
        if (error.response) {
          if (getIsOk(app as AppType, error.response.status)) {
            return error.response;
          }
        }
        throw new TRPCError({
          code: 'NOT_FOUND',
          cause: error.cause,
          message: error.message,
        });
      });
    return {
      status: data.status,
      statusText: data.statusText,
    };
  }),

  healthcheck: procedure.query(() => 'yay!'),
});

export type AppRouter = typeof appRouter;
