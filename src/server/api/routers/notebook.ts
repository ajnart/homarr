import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '~/server/db';
import { items, widgetOptions } from '~/server/db/schema';

import { adminProcedure, createTRPCRouter, publicProcedure } from '../trpc';

export const notebookRouter = createTRPCRouter({
  update: adminProcedure
    .input(z.object({ widgetId: z.string(), content: z.string(), boardName: z.string() }))
    .mutation(async ({ input }) => {
      const item = await db.query.items.findFirst({
        where: and(eq(items.id, input.widgetId), eq(items.kind, 'widget')),
        with: {
          widget: {
            with: {
              options: {
                where: eq(widgetOptions.path, 'content'),
              },
            },
          },
        },
      });

      if (!item?.widget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Specified widget was not found',
        });
      }

      // Update existing content
      if (item.widget.options.some((o) => o.path === 'content')) {
        await db
          .update(widgetOptions)
          .set({ value: input.content })
          .where(
            and(eq(widgetOptions.widgetId, item.widget.id), eq(widgetOptions.path, 'content'))
          );
        return;
      }

      // Or create new content
      await db.insert(widgetOptions).values({
        widgetId: item.widget.id,
        path: 'content',
        value: input.content,
        type: 'string',
      });
    }),
});
