import { randomUUID } from 'crypto';
import { db } from '~/server/db';
import { layouts } from '~/server/db/schema';
import { layoutCreateSchema } from '~/validations/layouts';

import { createTRPCRouter, publicProcedure } from '../../trpc';

export const layoutsRouter = createTRPCRouter({
  create: publicProcedure.input(layoutCreateSchema).mutation(async ({ ctx, input }) => {
    const id = randomUUID();
    await db
      .insert(layouts)
      .values({
        id,
        name: input.name,
        kind: input.kind,
        boardId: input.boardId,
        showLeftSidebar: input.showLeftSidebar,
        showRightSidebar: input.showRightSidebar,
        columnCount: input.columns,
      })
      .execute();

    return { id };
  }),
});
