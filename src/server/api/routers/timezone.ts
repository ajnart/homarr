import { z } from 'zod';
import { find } from 'geo-tz'

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
        return find(input.latitude,input.longitude)[0];
    }),
})