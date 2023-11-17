import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { User } from 'next-auth';
import { z } from 'zod';
import { db } from '~/server/db';
import { getIntegrationAsync } from '~/server/db/queries/integrations';
import { boards, widgets } from '~/server/db/schema';

import { createTRPCRouter, publicProcedure } from '../../trpc';
import { createUsenetClient } from './client/useNetClient';

const commonSchema = z.object({
  integrationId: z.string(),
});

const paginationSchema = z.object({
  limit: z.number(),
  offset: z.number(),
});

export const usenetRouter = createTRPCRouter({
  info: publicProcedure.input(commonSchema).query(async ({ input, ctx }) => {
    const dbIntegration = await getIntegrationOrThrowWhenNotAllowed(
      input.integrationId,
      ctx.session?.user
    );
    const client = createUsenetClient(dbIntegration);
    return await client.info();
  }),
  history: publicProcedure
    .input(commonSchema.merge(paginationSchema))
    .query(async ({ input, ctx }) => {
      const dbIntegration = await getIntegrationOrThrowWhenNotAllowed(
        input.integrationId,
        ctx.session?.user
      );
      const client = createUsenetClient(dbIntegration);
      return await client.history({ limit: input.limit, offset: input.offset });
    }),
  queue: publicProcedure
    .input(commonSchema.merge(paginationSchema))
    .query(async ({ input, ctx }) => {
      const dbIntegration = await getIntegrationOrThrowWhenNotAllowed(
        input.integrationId,
        ctx.session?.user
      );
      const client = createUsenetClient(dbIntegration);
      return await client.queue({
        limit: input.limit,
        offset: input.offset,
      });
    }),
  pause: publicProcedure.input(commonSchema).mutation(async ({ input, ctx }) => {
    const dbIntegration = await getIntegrationOrThrowWhenNotAllowed(
      input.integrationId,
      ctx.session?.user
    );
    const client = createUsenetClient(dbIntegration);
    return await client.pause();
  }),
  resume: publicProcedure.input(commonSchema).mutation(async ({ input, ctx }) => {
    const dbIntegration = await getIntegrationOrThrowWhenNotAllowed(
      input.integrationId,
      ctx.session?.user
    );
    const client = createUsenetClient(dbIntegration);
    return await client.resume();
  }),
});

async function userHasAccessToIntegration(
  integration: Exclude<Awaited<ReturnType<typeof getIntegrationAsync>>, undefined>,
  user: User | undefined | null
) {
  if (user?.isAdmin) return true;
  if (integration.widgets.length === 0) return false;
  if (user) return true;

  const boardWithAccess = await db.query.boards.findFirst({
    where: and(
      eq(boards.allowGuests, true),
      inArray(
        widgets.id,
        integration.widgets.map((w) => w.widgetId)
      )
    ),
    with: {
      items: {
        with: {
          widget: true,
        },
      },
    },
  });
  return boardWithAccess !== undefined;
}

async function getIntegrationOrThrowWhenNotAllowed(
  integrationId: string,
  user: User | undefined | null
) {
  const dbIntegration = await getIntegrationAsync(integrationId);

  if (!dbIntegration) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Integration not found',
    });
  }

  if (!(await userHasAccessToIntegration(dbIntegration, user))) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Not allowed to perform action',
    });
  }
  return dbIntegration;
}
