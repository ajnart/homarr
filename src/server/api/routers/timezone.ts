import { z } from 'zod';

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
        const tzlookup = require('tz-lookup');
        return tzlookup(input.latitude,input.longitude);
    }),
})