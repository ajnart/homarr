import { inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { db } from '~/server/db';
import { integrationSecrets, integrations } from '~/server/db/schema';

import { adminProcedure, createTRPCRouter } from '../trpc';

export const integrationsRouter = createTRPCRouter({
  allMedia: adminProcedure.query(async () => {
    return await db.query.integrations.findMany({
      where: inArray(integrations.type, ['jellyseerr', 'overseerr']),
    });
  }),

  findAll: adminProcedure.query(async () => {
    return await db.query.integrations.findMany({
      with: {
        secrets: true,
      },
    });
  }),

  addOne: adminProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.any(),
        url: z.string().url(),
        secrets: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const newId = nanoid(8);
      const integration = await db
        .insert(integrations)
        .values({
          id: newId,
          name: input.name,
          type: input.type,
          url: input.url,
        })
        .execute();

      const secrets = await db.insert(integrationSecrets).values(
        {
          integrationId: newId,
          key: 'apiKey',
          value: 'test'
        }
      );
      return { integration, secrets };
    }),
});
