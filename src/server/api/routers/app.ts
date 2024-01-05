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
      const config = getConfig(input.configName);
      const app = config.apps.find((app) => app.id === input.id);
      if (!app?.url) {
        return true;
      }
      try {
        await fetch(app.url, {
          method: 'HEAD',
          redirect: 'follow',
          cache: 'force-cache',
          // Avoid CORS issues
          mode: 'no-cors',
          headers: {
            // Cache for 5 minutes
            'Cache-Control': 'max-age=300',
          },
        });
      } catch (error: any) {
        if (error.cause.code === 'ENOTFOUND') {
          return false;
        }
      }
      return true;
    }),
});
