import { TRPCError } from '@trpc/server';
import { eq, inArray } from 'drizzle-orm';
import fs from 'fs';
import { z } from 'zod';
import { db } from '~/server/db';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import { boards, layoutItems, layouts, sections } from '~/server/db/schema';
import { configExists } from '~/tools/config/configExists';
import { getConfig } from '~/tools/config/getConfig';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { generateDefaultApp } from '~/tools/shared/app';

import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { configNameSchema } from './config';

export const boardRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

    const defaultBoard = await getDefaultBoardAsync(ctx.session.user.id, 'default');

    return await Promise.all(
      files.map(async (file) => {
        const name = file.replace('.json', '');
        const config = await getFrontendConfig(name);

        const countApps = config.apps.length;

        return {
          name: name,
          countApps: countApps,
          countWidgets: config.widgets.length,
          countCategories: config.categories.length,
          isDefaultForUser: name === defaultBoard,
        };
      })
    );
  }),
  addAppsForContainers: adminProcedure
    .input(
      z.object({
        boardName: configNameSchema,
        apps: z.array(
          z.object({
            name: z.string(),
            port: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      if (!(await configExists(input.boardName))) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }
      const config = await getConfig(input.boardName);

      const lowestWrapper = config?.wrappers.sort((a, b) => a.position - b.position)[0];

      const newConfig = {
        ...config,
        apps: [
          ...config.apps,
          ...input.apps.map((container) => {
            const defaultApp = generateDefaultApp(lowestWrapper.id);
            const address = container.port
              ? `http://localhost:${container.port}`
              : 'http://localhost';

            return {
              ...defaultApp,
              name: container.name,
              url: address,
              behaviour: {
                ...defaultApp.behaviour,
                externalUrl: address,
              },
            };
          }),
        ],
      };

      const targetPath = `data/configs/${input.boardName}.json`;
      fs.writeFileSync(targetPath, JSON.stringify(newConfig, null, 2), 'utf8');
    }),
  byName: publicProcedure
    .input(z.object({ boardName: configNameSchema, layout: z.string().optional() }))
    .query(async ({ input }) => {
      const board = await getFullBoardWithLayoutSectionsAsync(
        input.boardName,
        input.layout ?? 'default'
      );

      if (!board) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }

      const layout = board.layouts.at(0);
      if (!layout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Layout not found',
        });
      }
      const sectionIds = layout.sections.map((x) => x.id);
      const apps = await getAppsForSectionsAsync(sectionIds);
      const widgets = await getWidgetsForSectionsAsync(sectionIds);

      const preparedSections = layout.sections.map((section) => {
        const filteredApps = apps.filter((x) =>
          x.item.layouts.some((y) => y.sectionId === section.id)
        );
        const filteredWidgets = widgets.filter((x) =>
          x.item.layouts.some((y) => y.sectionId === section.id)
        );
        return mapSection(section, [
          ...filteredApps.map(mapApp),
          ...filteredWidgets.map(mapWidget),
        ]);
      });
      const { layouts, ...withoutLayouts } = board;
      return {
        ...withoutLayouts,
        sections: preparedSections,
      };
    }),
  byNameSimple: publicProcedure
    .input(z.object({ boardName: configNameSchema }))
    .query(async ({ input }) => {
      const board = await db.query.boards.findFirst({
        where: eq(boards.name, input.boardName),
      });

      if (!board) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }

      console.log(board);
      return board;
    }),
});

const getAppsForSectionsAsync = async (sectionIds: string[]) => {
  if (sectionIds.length === 0) return [];
  return await db.query.appItems.findMany({
    with: {
      app: {
        with: {
          integration: {
            with: {
              secrets: true,
            },
          },
          statusCodes: {
            columns: {
              code: true,
            },
          },
        },
      },
      item: {
        with: {
          layouts: {
            where: inArray(layoutItems.sectionId, sectionIds),
          },
        },
      },
    },
  });
};

const getFullBoardWithLayoutSectionsAsync = async (boardName: string, layoutName: string) => {
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
          name: true,
        },
        with: {
          sections: {
            orderBy: sections.position,
          },
        },
        where: eq(layouts.name, layoutName),
      },
    },
    where: eq(boards.name, boardName),
  });
};

const getWidgetsForSectionsAsync = async (sectionIds: string[]) => {
  if (sectionIds.length === 0) return [];
  return await db.query.widgets.findMany({
    with: {
      options: true,
      item: {
        with: {
          layouts: {
            where: inArray(layoutItems.sectionId, sectionIds),
          },
        },
      },
    },
  });
};

type FullBoardWithLayout = Exclude<
  Awaited<ReturnType<typeof getFullBoardWithLayoutSectionsAsync>>,
  undefined
>;

type MapSection = FullBoardWithLayout['layouts'][number]['sections'][number];
type MapApp = Awaited<ReturnType<typeof getAppsForSectionsAsync>>[number];
type MapWidget = Awaited<ReturnType<typeof getWidgetsForSectionsAsync>>[number];
type MapSecret = Exclude<MapApp['app']['integration'], null>['secrets'][number];
type MapOption = MapWidget['options'][number];

const mapSection = (
  section: Omit<MapSection, 'items'>,
  items: (ReturnType<typeof mapWidget> | ReturnType<typeof mapApp>)[]
) => {
  const { layoutId, ...withoutLayoutId } = section;
  if (section.type === 'empty') {
    const { name, position, type, ...sectionProps } = withoutLayoutId;
    return {
      ...sectionProps,
      type,
      position: section.position!,
      items,
    };
  }
  if (section.type === 'hidden') {
    const { name, position, type, ...sectionProps } = withoutLayoutId;
    return {
      ...sectionProps,
      type,
      position: null,
      items,
    };
  }
  if (section.type === 'category') {
    const { name, position, type, ...sectionProps } = withoutLayoutId;
    return {
      ...sectionProps,
      type,
      name: name!,
      position: section.position!,
      items,
    };
  }

  const { name, position, type, ...sectionProps } = withoutLayoutId;

  return {
    ...sectionProps,
    type,
    position: section.position === 0 ? ('left' as const) : ('right' as const),
    items,
  };
};

const mapWidget = (widgetItem: MapWidget) => {
  const { sectionId, itemId, id, ...commonLayoutItem } = widgetItem.item.layouts.at(0)!;
  const common = { ...commonLayoutItem, id: itemId };
  const { id: _id, itemId: _itemId, type, item, ...widget } = widgetItem;
  return {
    ...common,
    ...widget,
    type: 'widget' as const,
    sort: type,
    options: mapOptions(widget.options),
  };
};

const mapApp = (appItem: MapApp) => {
  const { sectionId, itemId, id, ...commonLayoutItem } = appItem.item.layouts.at(0)!;
  const common = { ...commonLayoutItem, id: itemId };
  const { app: innerApp, appId, itemId: _itemId, item, ...otherAppItem } = appItem;
  const { id: _id, integration, statusCodes, ...app } = appItem.app!;
  return {
    ...common,
    ...otherAppItem,
    ...app,
    type: 'app' as const,
    integration: integration
      ? {
          ...integration,
          secrets: integration.secrets.map(mapSecret),
        }
      : null,
    statusCodes: statusCodes.map((x) => x.code),
  };
};

const mapSecret = ({ integrationId, ...secret }: MapSecret) => {
  const isDefined = secret.value !== null && secret.value !== '';
  if (secret.visibility === 'private') {
    return {
      ...secret,
      visibility: 'private' as const,
      isDefined,
      value: null,
    };
  }

  return {
    ...secret,
    visibility: 'public' as const,
    isDefined,
  };
};

const mapOptions = (options: MapOption[]) => {
  const result = {} as Record<string, unknown>;
  const sorted = options.sort((a, b) => a.path.localeCompare(b.path));
  sorted.forEach((item) => {
    addAtPath(result, item);
  });
  return result;
};

const addAtPath = (outerObj: Record<string, unknown>, item: MapOption) => {
  const { path, value } = item;
  const pathArray = path.split('.');
  const lastKey = pathArray.pop()!;
  let current: any = outerObj;
  pathArray.forEach((key) => {
    if (Array.isArray(current)) {
      current = current[parseInt(key, 10)];
    } else if (typeof current === 'object') {
      current = current[key];
    }
  });

  if (item.type === 'array') {
    current[lastKey] = [];
  } else if (item.type === 'object') {
    current[lastKey] = {};
  } else if (item.type === 'number' && value) {
    current[lastKey] = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
  } else if (item.type === 'boolean') {
    current[lastKey] = value === 'true';
  } else if (item.type === 'string') {
    current[lastKey] = value;
  } else if (item.type === 'null') {
    current[lastKey] = null;
  }
};
