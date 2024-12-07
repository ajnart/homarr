import { randomBytes } from 'crypto';
import dayjs from 'dayjs';
import { v4 } from 'uuid';
import { z } from 'zod';
import { db } from '~/server/db';
import { migrateTokens } from '~/server/db/schema';

import { adminProcedure, createTRPCRouter } from '../trpc';

export const migrateRouter = createTRPCRouter({
  createToken: adminProcedure
    .input(z.object({ boards: z.boolean(), users: z.boolean(), integrations: z.boolean() }))
    .mutation(async ({ input }) => {
      const id = v4();
      const token = randomBytes(32).toString('hex');

      await db.insert(migrateTokens).values({
        id,
        token,
        ...input,
        expires: dayjs().add(5, 'minutes').toDate(),
      });

      return token;
    }),
});
