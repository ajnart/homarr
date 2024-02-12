import { randomBytes, randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { invites } from '~/server/db/schema';

import { adminProcedure, createTRPCRouter } from '../../trpc';

export const inviteRouter = createTRPCRouter({
  all: adminProcedure
    .meta({ openapi: { method: 'GET', path: '/invites', tags: ['invite'] } })
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(0),
      }),
    )
    .output(z.object({
      invites: z.array(z.object({
        id: z.string(),
        expires: z.date(),
        creator: z.string().or(z.null()),
      })),
      countPages: z.number().min(0),
    }))
    .query(async ({ input }) => {
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
    .meta({ openapi: { method: 'POST', path: '/invites', tags: ['invite'] } })
    .input(
      z.object({
        expiration: z
          .date()
          .min(dayjs().add(5, 'minutes').toDate())
          .max(dayjs().add(6, 'months').toDate()),
      }),
    )
    .output(z.object({
      id: z.string(),
      token: z.string(),
      expires: z.date(),
    }))
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
  delete: adminProcedure
    .meta({ openapi: { method: 'DELETE', path: '/invites', tags: ['invite'] } })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.delete(invites).where(eq(invites.id, input.id));
    }),
});
