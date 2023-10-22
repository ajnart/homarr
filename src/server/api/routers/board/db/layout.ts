import { randomUUID } from 'crypto';
import { db } from '~/server/db';
import { LayoutKind } from '~/server/db/items';
import { layouts, sections } from '~/server/db/schema';

type AddLayoutProps = {
  boardId: string;
  name: string;
  kind: LayoutKind;
};
export const addLayoutAsync = async (props: AddLayoutProps) => {
  const layout = {
    id: randomUUID(),
    ...props,
  };
  await db.insert(layouts).values(layout);
  await db.insert(sections).values({
    id: randomUUID(),
    layoutId: layout.id,
    kind: 'empty',
    position: 0,
  });
  return layout;
};
