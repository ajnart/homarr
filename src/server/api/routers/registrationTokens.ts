import { randomBytes } from 'crypto';
import dayjs from 'dayjs';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const inviteRouter = createTRPCRouter({
  getAllInvites: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish().default(10),
        page: z.number().min(0)
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const registrationTokens = await ctx.prisma.registrationToken.findMany({
        take: limit,
        skip: limit * input.page,
      });

      const countRegistrationTokens = await ctx.prisma.registrationToken.count();

      return {
        registrationTokens: registrationTokens.map((token) => ({
          id: token.id,
          expires: token.expires,
        })),
        countPages: Math.ceil(countRegistrationTokens / limit)
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
