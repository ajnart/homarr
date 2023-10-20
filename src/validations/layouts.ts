import { z } from 'zod';
import { layoutKinds } from '~/server/db/items';

export const layoutCreateFormSchema = z.object({
  showRightSidebar: z.boolean(),
  showLeftSidebar: z.boolean(),
  columns: z.number(),
  name: z.string().nonempty().max(64),
});

export const layoutCreateSchema = z
  .object({
    boardId: z.string(),
    kind: z.enum(layoutKinds),
  })
  .merge(layoutCreateFormSchema);
