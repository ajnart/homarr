import { inArray } from 'drizzle-orm';
import { db } from '~/server/db';
import { integrations } from '~/server/db/schema';

import { adminProcedure, createTRPCRouter } from '../trpc';

export const integrationRouter = createTRPCRouter({
  allMedia: adminProcedure.query(async () => {
    return await db.query.integrations.findMany({
      where: inArray(integrations.type, ['jellyseerr', 'overseerr']),
    });
  }),
});
