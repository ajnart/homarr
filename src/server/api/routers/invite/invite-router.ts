import { randomBytes, randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { invites } from '~/server/db/schema';

import { adminProcedure, createTRPCRouter, publicProcedure } from '../../trpc';

export const inviteRouter = createTRPCRouter({
  all: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const dbInvites = await db.query.invites.findMany({
        limit: limit,
        offset: limit * input.page,
        with: {
          createdBy: {
            columns: {
              name: true,
            },
          },
        },
      });

      const inviteCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(invites)
        .then((rows) => rows[0].count);

      return {
        invites: dbInvites.map((token) => ({
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
      const inviteToInsert = {
        id: randomUUID(),
        expires: input.expiration,
        createdById: ctx.session.user.id,
        token: randomBytes(20).toString('hex'),
      };
      await db.insert(invites).values(inviteToInsert);

      return {
        id: inviteToInsert.id,
        token: inviteToInsert.token,
        expires: inviteToInsert.expires,
      };
    }),
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(invites).where(eq(invites.id, input.id));
  }),
});
