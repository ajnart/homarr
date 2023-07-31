import { randomBytes } from 'crypto';
import dayjs from 'dayjs';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const inviteRouter = createTRPCRouter({
  getAllInvites: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const cursor = input.cursor;
      const registrationTokens = await ctx.prisma.registrationToken.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (registrationTokens.length > limit) {
        const nextItem = registrationTokens.pop();
        nextCursor = nextItem!.id;
      }

      return {
        registrationTokens: registrationTokens.map((token) => ({
          id: token.id,
          expires: token.expires,
        })),
        nextCursor,
      };
    }),
  createRegistrationToken: publicProcedure
    .input(
      z.object({
        expiration: z
          .date()
          .min(dayjs().add(5, 'minutes').toDate())
          .max(dayjs().add(6, 'months').toDate()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.prisma.registrationToken.create({
        data: {
          expires: input.expiration,
          token: randomBytes(20).toString('hex'),
        },
      });

      return {
        id: token.id,
        token: token.token,
        expires: token.expires,
      };
    }),
  deleteRegistrationToken: publicProcedure
    .input(z.object({ tokenId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.registrationToken.delete({
        where: {
          id: input.tokenId,
        },
      });
    }),
});
