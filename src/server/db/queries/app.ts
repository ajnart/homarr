import { and, eq } from 'drizzle-orm';
import { User } from 'next-auth';

import { db } from '..';
import { boards, items } from '../schema';

export const getAppAsync = async (boardId: string, id: string, user: User | null | undefined) => {
  return await db.query.items.findFirst({
    where: and(
      eq(items.boardId, boardId),
      eq(items.id, id),
      user ? undefined : eq(boards.allowGuests, true)
    ),
    with: {
      app: {
        with: {
          statusCodes: {
            columns: {
              code: true,
            },
          },
        },
      },
      board: {
        columns: {
          allowGuests: true,
        },
      },
    },
  });
};
