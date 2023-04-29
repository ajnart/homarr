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
      const response = await axios.get(`${input.url}/info`);
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
      const response = await axios.get(`${input.url}/load/storage`);
      console.log(response.data);

      return response.data;
    }),
});
