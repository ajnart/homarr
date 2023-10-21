import { randomUUID } from 'crypto';
import { db } from '~/server/db';
import { layouts, sections } from '~/server/db/schema';
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

    await db.insert(sections).values({
      id: randomUUID(),
      type: 'empty',
      layoutId: id,
      position: 0,
    });

    if (input.showLeftSidebar) {
      await addSidebarSection(id, 'left');
    }

    if (input.showRightSidebar) {
      await addSidebarSection(id, 'right');
    }

    return { id };
  }),
});

const addSidebarSection = async (layoutId: string, type: 'left' | 'right') => {
  await db.insert(sections).values({
    id: randomUUID(),
    type: 'sidebar',
    layoutId,
    position: type === 'right' ? 0 : 1,
  });
};
