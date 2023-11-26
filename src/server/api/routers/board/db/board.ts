import { eq } from 'drizzle-orm';
import { SQLiteColumn, SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import { db } from '~/server/db';
import { boards, layouts, sections } from '~/server/db/schema';

type ColumnKey<TEntity extends SQLiteTableWithColumns<any>> =
  TEntity extends SQLiteTableWithColumns<infer TColumns> ? keyof TColumns['columns'] : never;

type BoardParam<TKey extends ColumnKey<typeof boards>> = {
  key: TKey;
  value: typeof boards extends SQLiteTableWithColumns<infer TColumns>
    ? TColumns['columns'][TKey] extends SQLiteColumn<infer TColumn>
      ? TColumn['data']
      : never
    : never;
};

export const getFullBoardWithLayoutSectionsAsync = async (
  boardParam: BoardParam<'name'> | BoardParam<'id'>,
  layoutId: string | undefined,
  isMobile?: boolean
) => {
  return await db.query.boards.findFirst({
    columns: {
      ownerId: false,
    },
    with: {
      owner: {
        columns: {
          id: true,
          name: true,
        },
      },
      layouts: {
        columns: {
          id: true,
          name: true,
          showLeftSidebar: true,
          showRightSidebar: true,
          columnCount: true,
        },
        with: {
          sections: {
            orderBy: sections.position,
          },
        },
        where: layoutId
          ? eq(layouts.id, layoutId)
          : eq(layouts.kind, isMobile ? 'mobile' : 'desktop'),
      },
      mediaIntegrations: {
        with: {
          integration: true,
        },
      },
    },
    where: eq(boards[boardParam.key], boardParam.value),
  });
};
