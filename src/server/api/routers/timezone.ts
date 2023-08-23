import { z } from 'zod';
const GeoTz = require('browser-geo-tz/dist/geotz.js');

import { createTRPCRouter, publicProcedure } from '../trpc';

export const timezoneRouter = createTRPCRouter({
  at: publicProcedure
    .input(
        z.object({
        longitude: z.number(),
        latitude: z.number(),
        })
    )
    .query(async ({ input }) => {
        const timezone = GeoTz.find(input.latitude,input.longitude);
        return Array.isArray(timezone) ? timezone[0] : timezone;
    }),
})