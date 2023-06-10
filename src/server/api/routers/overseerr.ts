import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { z } from 'zod';
import { getConfig } from '~/tools/config/getConfig';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const overseerrRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        configName: z.string(),
        query: z.string().or(z.undefined()),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const app = config.apps.find(
        (app) => app.integration?.type === 'overseerr' || app.integration?.type === 'jellyseerr'
      );

      if (input.query === '' || input.query === undefined) {
        return [];
      }

      const apiKey = app?.integration?.properties.find((x) => x.field === 'apiKey')?.value;
      if (!app || !apiKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Wrong request',
        });
      }
      const appUrl = new URL(app.url);
      const data = await axios
        .get(`${appUrl.origin}/api/v1/search?query=${input.query}`, {
          headers: {
            // Set X-Api-Key to the value of the API key
            'X-Api-Key': apiKey,
          },
        })
        .then((res) => res.data);
      return data;
    }),
});
