import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

const dashDotUrlSchema = z.string().url();

const removeLeadingSlash = (x: string) => (x.endsWith('/') ? x.substring(0, x.length - 1) : x);

export const dashDotRouter = createTRPCRouter({
  info: publicProcedure
    .input(
      z.object({
        url: dashDotUrlSchema.transform(removeLeadingSlash),
      })
    )
    .output(
      z.object({
        storage: z.array(
          z.object({
            size: z.number(),
          })
        ),
        network: z.object({
          speedUp: z.number(),
          speedDown: z.number(),
        }),
      })
    )
    .query(async ({ input }) => {
      const response = await axios.get(`${input.url}/info`).catch((error) => {
        if (error.response.status === 404) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Unable to find specified dash-dot instance',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      });
      return response.data;
    }),
  storage: publicProcedure
    .input(
      z.object({
        url: dashDotUrlSchema.transform(removeLeadingSlash),
      })
    )
    .output(z.array(z.number()))
    .query(async ({ input }) => {
      const response = await axios.get(`${input.url}/load/storage`).catch((error) => {
        if (error.response.status === 404) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Unable to find specified dash-dot',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      });
      return response.data;
    }),
});
