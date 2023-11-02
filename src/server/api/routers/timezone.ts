import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

const GeoTz = require('browser-geo-tz/dist/geotz.js');

export const timezoneRouter = createTRPCRouter({
  at: publicProcedure
    .input(
      z.object({
        longitude: z.number(),
        latitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      const timezone = await GeoTz.find(input.latitude, input.longitude);
      return Array.isArray(timezone) ? timezone[0] : timezone;
    }),
});
