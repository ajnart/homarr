import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { eq, inArray } from 'drizzle-orm';
import fs from 'fs';
import { z } from 'zod';
import { db } from '~/server/db';
import { LayoutKind, WidgetSort } from '~/server/db/items';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import {
  appItems,
  apps,
  boards,
  items,
  layoutItems,
  layouts,
  sections,
  widgets,
} from '~/server/db/schema';
import { configExists } from '~/tools/config/configExists';
import { getConfig } from '~/tools/config/getConfig';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { generateDefaultApp } from '~/tools/shared/app';
import { boardCustomizationSchema, createBoardSchema } from '~/validations/boards';
import { isMobileUserAgent } from '~/validations/mobile';

import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { configNameSchema } from './config';

export const boardRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
    const dbBoards = await db.query.boards.findMany({
      columns: {
        name: true,
      },
      with: {
        items: true,
      },
    });

    const defaultBoard = await getDefaultBoardAsync(ctx.session.user.id, 'default');

    const result = await Promise.all(
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
          type: 'file',
        };
      })
    );

    return result.concat(
      dbBoards.map((x) => ({
        name: x.name,
        countApps: x.items.filter((x) => x.type === 'app').length,
        countWidgets: x.items.filter((x) => x.type === 'widget').length,
        countCategories: 0, // TODO: Is different depending on layout
        isDefaultForUser: x.name === defaultBoard,
        type: 'db',
      }))
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
    .input(z.object({ boardName: configNameSchema, layoutId: z.string().optional() }))
    .query(async ({ input }) => {
      const board = await getFullBoardWithLayoutSectionsAsync(input.boardName, input.layoutId);

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
        layoutName: layout.name,
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
      return board;
    }),
  updateCustomization: protectedProcedure
    .input(z.object({ boardName: configNameSchema, customization: boardCustomizationSchema }))
    .mutation(async ({ input }) => {
      const dbBoard = await db.query.boards.findFirst({
        where: eq(boards.name, input.boardName),
      });

      if (!dbBoard) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Board not found',
        });
      }

      await db
        .update(boards)
        .set({
          allowGuests: input.customization.access.allowGuests,
          isPingEnabled: input.customization.layout.pingsEnabled,
          appOpacity: input.customization.appearance.opacity,
          backgroundImageUrl: input.customization.appearance.backgroundSrc,
          primaryColor: input.customization.appearance.primaryColor,
          secondaryColor: input.customization.appearance.secondaryColor,
          customCss: input.customization.appearance.customCss,
          pageTitle: input.customization.pageMetadata.pageTitle,
          metaTitle: input.customization.pageMetadata.metaTitle,
          logoImageUrl: input.customization.pageMetadata.logoSrc,
          faviconImageUrl: input.customization.pageMetadata.faviconSrc,
          primaryShade: input.customization.appearance.shade,
        })
        .where(eq(boards.id, dbBoard.id));

      return dbBoard;
    }),
  exampleBoard: protectedProcedure
    .input(z.object({ boardName: configNameSchema }))
    .mutation(async ({ input, ctx }) => {
      const boardId = randomUUID();
      const layoutId = randomUUID();
      const sectionId = randomUUID();
      await db.insert(boards).values({
        id: boardId,
        name: input.boardName,
        ownerId: ctx.session.user.id,
      });

      await db.insert(layouts).values({
        id: layoutId,
        name: 'default',
        boardId,
        kind: 'desktop',
      });

      await db.insert(sections).values({
        id: sectionId,
        layoutId,
        type: 'empty',
        position: 0,
      });

      await addApp({
        boardId,
        sectionId,
        name: 'Contribute',
        internalUrl: 'https://github.com/ajnart/homarr',
        iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/github.png',
        width: 2,
        height: 1,
        x: 2,
        y: 0,
      });

      await addApp({
        boardId,
        sectionId,
        name: 'Discord',
        internalUrl: 'https://discord.com/invite/aCsmEV5RgA',
        iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/discord.png',
        width: 2,
        height: 1,
        x: 4,
        y: 0,
      });

      await addApp({
        boardId,
        sectionId,
        name: 'Donate',
        internalUrl: 'https://ko-fi.com/ajnart',
        iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/ko-fi.png',
        width: 2,
        height: 1,
        x: 6,
        y: 0,
      });

      await addApp({
        boardId,
        sectionId,
        name: 'Documentation',
        internalUrl: 'https://homarr.dev',
        iconUrl: '/imgs/logo/logo.png',
        width: 2,
        height: 2,
        x: 6,
        y: 1,
      });

      await addWidget({
        boardId,
        sectionId,
        type: 'weather',
        width: 2,
        height: 1,
        x: 0,
        y: 0,
      });

      await addWidget({
        boardId,
        sectionId,
        type: 'date',
        width: 2,
        height: 1,
        x: 8,
        y: 0,
      });

      await addWidget({
        boardId,
        sectionId,
        type: 'date',
        width: 2,
        height: 1,
        x: 8,
        y: 1,
      });

      await addWidget({
        boardId,
        sectionId,
        type: 'notebook',
        width: 6,
        height: 3,
        x: 0,
        y: 1,
      });
    }),
  create: adminProcedure.input(createBoardSchema).mutation(async ({ ctx, input }) => {
    const existingBoard = await db.query.boards.findFirst({
      where: eq(boards.name, input.boardName),
    });

    if (existingBoard) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Board already exists',
      });
    }

    const isMobile = isMobileUserAgent(ctx.headers['user-agent'] ?? '');
    const boardId = randomUUID();
    await db.insert(boards).values({
      id: boardId,
      name: input.boardName,
      pageTitle: input.pageTitle,
      allowGuests: input.allowGuests,
      ownerId: ctx.session.user.id,
    });

    const mobileLayout = await addLayoutAsync({
      boardId,
      name: 'Mobile layout',
      kind: 'mobile',
    });

    const desktopLayout = await addLayoutAsync({
      boardId,
      name: 'Desktop layout',
      kind: 'desktop',
    });

    if (isMobile) {
      return mobileLayout;
    }
    return desktopLayout;
  }),
  checkNameAvailable: adminProcedure
    .input(z.object({ boardName: configNameSchema }))
    .query(async ({ input }) => {
      const board = await db.query.boards.findFirst({
        where: eq(boards.name, input.boardName),
      });

      return !board;
    }),
});

type AddLayoutProps = {
  boardId: string;
  name: string;
  kind: LayoutKind;
};
const addLayoutAsync = async (props: AddLayoutProps) => {
  const layout = {
    id: randomUUID(),
    ...props,
  };
  await db.insert(layouts).values(layout);
  await db.insert(sections).values({
    id: randomUUID(),
    layoutId: layout.id,
    type: 'empty',
    position: 0,
  });
  return layout;
};

type AddWidgetProps = {
  boardId: string;
  sectionId: string;
  type: WidgetSort;
  width: number;
  height: number;
  x: number;
  y: number;
};

const addWidget = async ({ boardId, sectionId, type, ...positionProps }: AddWidgetProps) => {
  const itemId = randomUUID();
  await db.insert(items).values({
    id: itemId,
    type: 'widget',
    boardId,
  });

  const widgetId = randomUUID();
  await db.insert(widgets).values({
    id: widgetId,
    type,
    itemId,
  });

  const layoutItemId = randomUUID();
  await db.insert(layoutItems).values({
    id: layoutItemId,
    itemId,
    sectionId,
    ...positionProps,
  });
};

type AddAppProps = {
  boardId: string;
  sectionId: string;
  name: string;
  internalUrl: string;
  iconUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

const addApp = async ({
  boardId,
  sectionId,
  iconUrl,
  internalUrl,
  name,
  ...positionProps
}: AddAppProps) => {
  const itemId = randomUUID();
  await db.insert(items).values({
    id: itemId,
    type: 'app',
    boardId,
  });

  const appId = randomUUID();
  await db.insert(apps).values({
    id: appId,
    name,
    internalUrl,
    iconUrl,
  });

  await db.insert(appItems).values({
    appId: appId,
    itemId: itemId,
  });

  const layoutItemId = randomUUID();
  await db.insert(layoutItems).values({
    id: layoutItemId,
    itemId,
    sectionId,
    ...positionProps,
  });
};

const getAppsForSectionsAsync = async (sectionIds: string[]) => {
  if (sectionIds.length === 0) return [];

  return await db.query.appItems.findMany({
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

const getFullBoardWithLayoutSectionsAsync = async (
  boardName: string,
  layoutId: string | undefined
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
          name: true,
        },
        with: {
          sections: {
            orderBy: sections.position,
          },
        },
        where: layoutId ? eq(layouts.id, layoutId) : undefined,
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
type MapOption = MapWidget['options'][number];

const mapSection = (
  section: Omit<MapSection, 'items'>,
  items: (ReturnType<typeof mapWidget> | ReturnType<typeof mapApp>)[]
) => {
  const { layoutId, ...withoutLayoutId } = section;
  if (withoutLayoutId.type === 'empty') {
    const { name, position, type, ...sectionProps } = withoutLayoutId;
    return {
      ...sectionProps,
      type,
      position: section.position!,
      items,
    };
  }
  if (withoutLayoutId.type === 'hidden') {
    const { name, position, type, ...sectionProps } = withoutLayoutId;
    return {
      ...sectionProps,
      type,
      position: null,
      items,
    };
  }
  if (withoutLayoutId.type === 'category') {
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
    position: position === 0 ? ('left' as const) : ('right' as const),
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
  const { id: _id, statusCodes, ...app } = appItem.app!;
  return {
    ...common,
    ...otherAppItem,
    ...app,
    type: 'app' as const,
    statusCodes: statusCodes.map((x) => x.code),
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
