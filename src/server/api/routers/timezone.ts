import { z } from 'zod';
import { find } from 'geo-tz'

import { createTRPCRouter, publicProcedure } from '../trpc';

export const timezoneRouter = createTRPCRouter({
  at: publicProcedure
    .input(
        z.object({
        longitude: z.number(),
        latitude: z.number(),
        }).optional()
    )
    .query(async ({ input }) => {
        return input? find(input.latitude,input.longitude)[0] : undefined;
    }),
})