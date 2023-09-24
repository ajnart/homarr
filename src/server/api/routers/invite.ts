import { randomBytes } from 'crypto';
import dayjs from 'dayjs';
import { z } from 'zod';

import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc';

export const inviteRouter = createTRPCRouter({
  all: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish().default(10),
        page: z.number().min(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const invites = await ctx.prisma.invite.findMany({
        take: limit,
        skip: limit * input.page,
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      });

      const inviteCount = await ctx.prisma.invite.count();

      return {
        invites: invites.map((token) => ({
          id: token.id,
          expires: token.expires,
          creator: token.createdBy.name,
        })),
        countPages: Math.ceil(inviteCount / limit),
      };
    }),
  create: adminProcedure
    .input(
      z.object({
        expiration: z
          .date()
          .min(dayjs().add(5, 'minutes').toDate())
          .max(dayjs().add(6, 'months').toDate()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.prisma.invite.create({
        data: {
          expires: input.expiration,
          createdById: ctx.session.user.id,
          token: randomBytes(20).toString('hex'),
        },
      });

      return {
        id: token.id,
        token: token.token,
        expires: token.expires,
      };
    }),
  delete: adminProcedure
    .input(z.object({ tokenId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.invite.delete({
        where: {
          id: input.tokenId,
        },
      });
    }),
});
