import { and, eq } from 'drizzle-orm';
import { User } from 'next-auth';
import { mapWidgetOptions } from '~/server/api/routers/board/mapping/options';
import { objectEntries } from '~/tools/object';
import widgetDefinitions from '~/widgets';
import { InferWidgetOptions } from '~/widgets/widgets';

import { db } from '..';
import { boards, items, widgets } from '../schema';

export const getWidgetAsync = async <TType extends keyof typeof widgetDefinitions>(
  boardId: string,
  id: string,
  user: User | null | undefined,
  type: TType
) => {
  const widgetItem = await db.query.items.findFirst({
    where: and(
      eq(items.boardId, boardId),
      eq(items.id, id),
      user ? undefined : eq(boards.allowGuests, true),
      eq(widgets.type, type)
    ),
    with: {
      widget: {
        with: {
          integrations: {
            with: {
              integration: {
                with: {
                  secrets: true,
                },
              },
            },
          },
          options: true,
        },
      },
      board: {
        columns: {
          allowGuests: true,
        },
      },
    },
  });

  if (!widgetItem || !widgetItem.widget) {
    return null;
  }

  const mappedOptions = mapWidgetOptions(
    widgetItem.widget.options.sort((a, b) => a.path.localeCompare(b.path))
  );
  objectEntries(widgetDefinitions[type].options).forEach(([key, definition]) => {
    mappedOptions[key] = mappedOptions[key] ?? definition.defaultValue;
  });

  return {
    id: widgetItem.id,
    type: widgetItem.widget.type,
    options: mappedOptions as InferWidgetOptions<(typeof widgetDefinitions)[TType]>,
    integrations: widgetItem.widget!.integrations.map((i) => ({
      ...i.integration,
    })),
  };
};

export type WidgetIntegration = Exclude<
  Awaited<ReturnType<typeof getWidgetAsync>>,
  null
>['integrations'][number];
