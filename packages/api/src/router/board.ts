import { TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod/v4";

import { constructBoardPermissions } from "@homarr/auth/shared";
import { createId } from "@homarr/common";
import type { DeviceType } from "@homarr/common/server";
import type { Database, InferInsertModel, InferSelectModel, SQL } from "@homarr/db";
import { and, asc, eq, handleTransactionsAsync, inArray, isNull, like, not, or, sql } from "@homarr/db";
import { createDbInsertCollectionWithoutTransaction } from "@homarr/db/collection";
import { getServerSettingByKeyAsync } from "@homarr/db/queries";
import {
  boardGroupPermissions,
  boards,
  boardUserPermissions,
  groupMembers,
  groupPermissions,
  groups,
  integrationGroupPermissions,
  integrationItems,
  integrationUserPermissions,
  itemLayouts,
  items,
  layouts,
  sectionCollapseStates,
  sectionLayouts,
  sections,
  users,
} from "@homarr/db/schema";
import type { WidgetKind } from "@homarr/definitions";
import {
  emptySuperJSON,
  everyoneGroup,
  getPermissionsWithChildren,
  getPermissionsWithParents,
  widgetKinds,
} from "@homarr/definitions";
import { importOldmarrAsync } from "@homarr/old-import";
import { importJsonFileSchema } from "@homarr/old-import/shared";
import { oldmarrConfigSchema } from "@homarr/old-schema";
import {
  boardByNameSchema,
  boardChangeVisibilitySchema,
  boardCreateSchema,
  boardDuplicateSchema,
  boardRenameSchema,
  boardSaveLayoutsSchema,
  boardSavePartialSettingsSchema,
  boardSavePermissionsSchema,
  boardSaveSchema,
} from "@homarr/validation/board";
import { byIdSchema } from "@homarr/validation/common";
import { zodUnionFromArray } from "@homarr/validation/enums";
import type { BoardItemAdvancedOptions } from "@homarr/validation/shared";
import { sectionSchema, sharedItemSchema } from "@homarr/validation/shared";

import { createTRPCRouter, permissionRequiredProcedure, protectedProcedure, publicProcedure } from "../trpc";
import { throwIfActionForbiddenAsync } from "./board/board-access";
import { generateResponsiveGridFor } from "./board/grid-algorithm";

export const boardRouter = createTRPCRouter({
  exists: permissionRequiredProcedure
    .requiresPermission("board-create")
    .input(z.string())
    .query(async ({ ctx, input: name }) => {
      try {
        await noBoardWithSimilarNameAsync(ctx.db, name);
        return false;
      } catch (error) {
        if (error instanceof TRPCError && error.code === "CONFLICT") {
          return true;
        }
        throw error;
      }
    }),
  getPublicBoards: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.boards.findMany({
      columns: {
        id: true,
        name: true,
        logoImageUrl: true,
      },
      where: eq(boards.isPublic, true),
    });
  }),
  getBoardsForGroup: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const dbEveryoneAndCurrentGroup = await ctx.db.query.groups.findMany({
        where: or(eq(groups.name, everyoneGroup), eq(groups.id, input.groupId)),
        with: {
          boardPermissions: true,
          permissions: true,
        },
      });

      const distinctPermissions = new Set(
        dbEveryoneAndCurrentGroup.flatMap((group) => group.permissions.map(({ permission }) => permission)),
      );
      const canViewAllBoards = getPermissionsWithChildren([...distinctPermissions]).includes("board-view-all");

      const boardIds = dbEveryoneAndCurrentGroup.flatMap((group) =>
        group.boardPermissions.map(({ boardId }) => boardId),
      );
      const boardWhere = canViewAllBoards ? undefined : or(eq(boards.isPublic, true), inArray(boards.id, boardIds));

      return await ctx.db.query.boards.findMany({
        columns: {
          id: true,
          name: true,
          logoImageUrl: true,
        },
        where: boardWhere,
      });
    }),
  getAllBoards: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;
    const permissionsOfCurrentUserWhenPresent = await ctx.db.query.boardUserPermissions.findMany({
      where: eq(boardUserPermissions.userId, userId ?? ""),
    });

    const permissionsOfCurrentUserGroupsWhenPresent = await ctx.db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, userId ?? ""),
      with: {
        group: {
          with: {
            boardPermissions: {},
          },
        },
      },
    });
    const boardIds = permissionsOfCurrentUserWhenPresent
      .map((permission) => permission.boardId)
      .concat(
        permissionsOfCurrentUserGroupsWhenPresent
          .map((groupMember) => groupMember.group.boardPermissions.map((permission) => permission.boardId))
          .flat(),
      );

    const currentUserWhenPresent = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId ?? ""),
    });

    const dbBoards = await ctx.db.query.boards.findMany({
      columns: {
        id: true,
        name: true,
        logoImageUrl: true,
        isPublic: true,
      },
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        userPermissions: {
          where: eq(boardUserPermissions.userId, ctx.session?.user.id ?? ""),
        },
        groupPermissions: {
          where:
            permissionsOfCurrentUserGroupsWhenPresent.length >= 1
              ? inArray(
                  boardGroupPermissions.groupId,
                  permissionsOfCurrentUserGroupsWhenPresent.map((groupMember) => groupMember.groupId),
                )
              : undefined,
        },
      },
      // Allow viewing all boards if the user has the permission
      where: ctx.session?.user.permissions.includes("board-view-all")
        ? undefined
        : or(
            eq(boards.isPublic, true),
            eq(boards.creatorId, ctx.session?.user.id ?? ""),
            boardIds.length > 0 ? inArray(boards.id, boardIds) : undefined,
          ),
    });
    return dbBoards.map((board) => ({
      ...board,
      isHome: currentUserWhenPresent?.homeBoardId === board.id,
      isMobileHome: currentUserWhenPresent?.mobileHomeBoardId === board.id,
    }));
  }),
  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const permissionsOfCurrentUserWhenPresent = await ctx.db.query.boardUserPermissions.findMany({
        where: eq(boardUserPermissions.userId, userId ?? ""),
      });

      const permissionsOfCurrentUserGroupsWhenPresent = await ctx.db.query.groupMembers.findMany({
        where: eq(groupMembers.userId, userId ?? ""),
        with: {
          group: {
            with: {
              boardPermissions: {},
            },
          },
        },
      });
      const boardIds = permissionsOfCurrentUserWhenPresent
        .map((permission) => permission.boardId)
        .concat(
          permissionsOfCurrentUserGroupsWhenPresent
            .map((groupMember) => groupMember.group.boardPermissions.map((permission) => permission.boardId))
            .flat(),
        );

      const currentUserWhenPresent = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId ?? ""),
      });

      const foundBoards = await ctx.db.query.boards.findMany({
        where: and(
          like(boards.name, `%${input.query}%`),
          ctx.session?.user.permissions.includes("board-view-all")
            ? undefined
            : or(
                eq(boards.isPublic, true),
                eq(boards.creatorId, ctx.session?.user.id ?? ""),
                inArray(boards.id, boardIds),
              ),
        ),
        limit: input.limit,
        columns: {
          id: true,
          name: true,
          creatorId: true,
          isPublic: true,
          logoImageUrl: true,
        },
        with: {
          userPermissions: {
            where: eq(boardUserPermissions.userId, ctx.session?.user.id ?? ""),
          },
          groupPermissions: {
            where:
              permissionsOfCurrentUserGroupsWhenPresent.length >= 1
                ? inArray(
                    boardGroupPermissions.groupId,
                    permissionsOfCurrentUserGroupsWhenPresent.map((groupMember) => groupMember.groupId),
                  )
                : undefined,
          },
        },
      });

      return foundBoards.map((board) => ({
        id: board.id,
        name: board.name,
        logoImageUrl: board.logoImageUrl,
        permissions: constructBoardPermissions(board, ctx.session),
        isHome: currentUserWhenPresent?.homeBoardId === board.id,
        isMobileHome: currentUserWhenPresent?.mobileHomeBoardId === board.id,
      }));
    }),
  createBoard: permissionRequiredProcedure
    .requiresPermission("board-create")
    .input(boardCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const boardId = createId();

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          homeBoardId: true,
        },
      });

      const createBoardCollection = createDbInsertCollectionWithoutTransaction(["boards", "sections", "layouts"]);

      createBoardCollection.boards.push({
        id: boardId,
        name: input.name,
        isPublic: input.isPublic,
        creatorId: ctx.session.user.id,
      });
      createBoardCollection.sections.push({
        id: createId(),
        kind: "empty",
        xOffset: 0,
        yOffset: 0,
        boardId,
      });
      createBoardCollection.layouts.push({
        id: createId(),
        name: "Base",
        columnCount: input.columnCount,
        breakpoint: 0,
        boardId,
      });

      await createBoardCollection.insertAllAsync(ctx.db);

      if (!user?.homeBoardId) {
        await ctx.db.update(users).set({ homeBoardId: boardId }).where(eq(users.id, ctx.session.user.id));
      }

      return { boardId };
    }),
  duplicateBoard: permissionRequiredProcedure
    .requiresPermission("board-create")
    .input(boardDuplicateSchema)
    .mutation(async ({ ctx, input }) => {
      await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "view");
      await noBoardWithSimilarNameAsync(ctx.db, input.name);

      const board = await ctx.db.query.boards.findFirst({
        where: eq(boards.id, input.id),
        with: {
          layouts: true,
          sections: {
            with: {
              collapseStates: true,
              layouts: true,
            },
          },
          items: {
            with: {
              layouts: true,
              integrations: true,
            },
          },
        },
      });

      if (!board) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      const { sections: boardSections, items: boardItems, layouts: boardLayouts, ...boardProps } = board;

      const newBoardId = createId();

      const layoutsMap = new Map<string, string>(boardLayouts.map((layout) => [layout.id, createId()]));
      const layoutsToInsert = boardLayouts.map((layout) => ({
        ...layout,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: layoutsMap.get(layout.id)!,
        boardId: newBoardId,
      }));

      const sectionMap = new Map<string, string>(boardSections.map((section) => [section.id, createId()]));
      const sectionsToInsert: InferInsertModel<typeof sections>[] = boardSections.map(
        ({ collapseStates: _, layouts: _layouts, ...section }) => ({
          ...section,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: sectionMap.get(section.id)!,
          boardId: newBoardId,
        }),
      );

      const sectionLayoutsToInsert: InferInsertModel<typeof sectionLayouts>[] = boardSections.flatMap((section) =>
        section.layouts.map(
          (layoutSection): InferInsertModel<typeof sectionLayouts> => ({
            ...layoutSection,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            layoutId: layoutsMap.get(layoutSection.layoutId)!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            sectionId: sectionMap.get(layoutSection.sectionId)!,
            parentSectionId: layoutSection.parentSectionId
              ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                sectionMap.get(layoutSection.parentSectionId)!
              : layoutSection.parentSectionId,
          }),
        ),
      );
      const sectionCollapseStatesToInsert: InferInsertModel<typeof sectionCollapseStates>[] = boardSections.flatMap(
        (section) =>
          section.collapseStates.map(
            (collapseState): InferInsertModel<typeof sectionCollapseStates> => ({
              ...collapseState,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              sectionId: sectionMap.get(collapseState.sectionId)!,
            }),
          ),
      );

      const itemMap = new Map<string, string>(boardItems.map((item) => [item.id, createId()]));
      const itemsToInsert: InferInsertModel<typeof items>[] = boardItems.map(
        ({ integrations: _, layouts: _layouts, ...item }) => ({
          ...item,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: itemMap.get(item.id)!,
          boardId: newBoardId,
        }),
      );

      const itemLayoutsToInsert: InferInsertModel<typeof itemLayouts>[] = boardItems.flatMap((item) =>
        item.layouts.map(
          (layoutSection): InferInsertModel<typeof itemLayouts> => ({
            ...layoutSection,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            sectionId: sectionMap.get(layoutSection.sectionId)!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            itemId: itemMap.get(layoutSection.itemId)!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            layoutId: layoutsMap.get(layoutSection.layoutId)!,
          }),
        ),
      );

      // Creates a list with all integration ids the user has access to
      const hasAccessForAll = ctx.session.user.permissions.includes("integration-use-all");
      const integrationIdsWithAccess = hasAccessForAll
        ? []
        : await ctx.db
            .selectDistinct({
              id: integrationGroupPermissions.integrationId,
            })
            .from(integrationGroupPermissions)
            .leftJoin(groupMembers, eq(integrationGroupPermissions.groupId, groupMembers.groupId))
            .where(eq(groupMembers.userId, ctx.session.user.id))
            .union(
              ctx.db
                .selectDistinct({ id: integrationUserPermissions.integrationId })
                .from(integrationUserPermissions)
                .where(eq(integrationUserPermissions.userId, ctx.session.user.id)),
            )
            .then((result) => result.map((row) => row.id));

      const itemIntegrationsToInsert = boardItems.flatMap((item) =>
        item.integrations
          // Restrict integrations to only those the user has access to
          .filter(({ integrationId }) => integrationIdsWithAccess.includes(integrationId) || hasAccessForAll)
          .map((integration) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            itemId: itemMap.get(item.id)!,
            integrationId: integration.integrationId,
          })),
      );

      await handleTransactionsAsync(ctx.db, {
        async handleAsync(db, schema) {
          await db.transaction(async (transaction) => {
            transaction.insert(schema.boards).values({
              ...boardProps,
              id: newBoardId,
              name: input.name,
              creatorId: ctx.session.user.id,
            });

            if (layoutsToInsert.length > 0) {
              await transaction.insert(schema.layouts).values(layoutsToInsert);
            }

            if (sectionsToInsert.length > 0) {
              await transaction.insert(schema.sections).values(sectionsToInsert);
            }

            if (sectionLayoutsToInsert.length > 0) {
              await transaction.insert(schema.sectionLayouts).values(sectionLayoutsToInsert);
            }

            if (sectionCollapseStatesToInsert.length > 0) {
              await transaction.insert(schema.sectionCollapseStates).values(sectionCollapseStatesToInsert);
            }

            if (itemsToInsert.length > 0) {
              await transaction.insert(schema.items).values(itemsToInsert);
            }

            if (itemLayoutsToInsert.length > 0) {
              await transaction.insert(schema.itemLayouts).values(itemLayoutsToInsert);
            }

            if (itemIntegrationsToInsert.length > 0) {
              await transaction.insert(schema.integrationItems).values(itemIntegrationsToInsert);
            }
          });
        },
        handleSync(db) {
          db.transaction((transaction) => {
            transaction
              .insert(boards)
              .values({
                ...boardProps,
                id: newBoardId,
                name: input.name,
                creatorId: ctx.session.user.id,
              })
              .run();

            if (layoutsToInsert.length > 0) {
              transaction.insert(layouts).values(layoutsToInsert).run();
            }

            if (sectionsToInsert.length > 0) {
              transaction.insert(sections).values(sectionsToInsert).run();
            }

            if (sectionLayoutsToInsert.length > 0) {
              transaction.insert(sectionLayouts).values(sectionLayoutsToInsert).run();
            }

            if (sectionCollapseStatesToInsert.length > 0) {
              transaction.insert(sectionCollapseStates).values(sectionCollapseStatesToInsert).run();
            }

            if (itemsToInsert.length > 0) {
              transaction.insert(items).values(itemsToInsert).run();
            }

            if (itemLayoutsToInsert.length > 0) {
              transaction.insert(itemLayouts).values(itemLayoutsToInsert).run();
            }

            if (itemIntegrationsToInsert.length > 0) {
              transaction.insert(integrationItems).values(itemIntegrationsToInsert).run();
            }
          });
        },
      });
    }),
  renameBoard: protectedProcedure.input(boardRenameSchema).mutation(async ({ ctx, input }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "full");

    await noBoardWithSimilarNameAsync(ctx.db, input.name, [input.id]);

    await ctx.db.update(boards).set({ name: input.name }).where(eq(boards.id, input.id));
  }),
  changeBoardVisibility: protectedProcedure.input(boardChangeVisibilitySchema).mutation(async ({ ctx, input }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "full");
    const boardSettings = await getServerSettingByKeyAsync(ctx.db, "board");

    if (
      input.visibility !== "public" &&
      (boardSettings.homeBoardId === input.id || boardSettings.mobileHomeBoardId === input.id)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot make home board private",
      });
    }

    await ctx.db
      .update(boards)
      .set({ isPublic: input.visibility === "public" })
      .where(eq(boards.id, input.id));
  }),
  deleteBoard: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "full");

    await ctx.db.delete(boards).where(eq(boards.id, input.id));
  }),
  setHomeBoard: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "view");

    await ctx.db.update(users).set({ homeBoardId: input.id }).where(eq(users.id, ctx.session.user.id));
  }),
  setMobileHomeBoard: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "view");

    await ctx.db.update(users).set({ mobileHomeBoardId: input.id }).where(eq(users.id, ctx.session.user.id));
  }),
  getHomeBoard: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;
    const user = userId
      ? ((await ctx.db.query.users.findFirst({
          where: eq(users.id, userId),
        })) ?? null)
      : null;

    const homeBoardId = await getHomeIdBoardAsync(ctx.db, user, ctx.deviceType);

    if (!homeBoardId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No home board found",
      });
    }

    const boardWhere = eq(boards.id, homeBoardId);

    await throwIfActionForbiddenAsync(ctx, boardWhere, "view");

    return await getFullBoardWithWhereAsync(ctx.db, boardWhere, ctx.session?.user.id ?? null);
  }),
  getBoardByName: publicProcedure.input(boardByNameSchema).query(async ({ input, ctx }) => {
    const boardWhere = eq(sql`UPPER(${boards.name})`, input.name.toUpperCase());
    await throwIfActionForbiddenAsync(ctx, boardWhere, "view");

    return await getFullBoardWithWhereAsync(ctx.db, boardWhere, ctx.session?.user.id ?? null);
  }),
  saveLayouts: protectedProcedure.input(boardSaveLayoutsSchema).mutation(async ({ ctx, input }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "modify");

    const board = await getFullBoardWithWhereAsync(ctx.db, eq(boards.id, input.id), ctx.session.user.id);

    const addedLayouts = filterAddedItems(input.layouts, board.layouts);

    const layoutsToInsert: InferInsertModel<typeof layouts>[] = [];
    const itemSectionLayoutsToInsert: InferInsertModel<typeof itemLayouts>[] = [];
    const sectionLayoutsToInsert: InferInsertModel<typeof sectionLayouts>[] = [];

    for (const addedLayout of addedLayouts) {
      const layoutId = createId();

      layoutsToInsert.push({
        id: layoutId,
        name: addedLayout.name,
        columnCount: addedLayout.columnCount,
        breakpoint: addedLayout.breakpoint,
        boardId: board.id,
      });

      const sortedLayouts = board.layouts.sort((layoutA, layoutB) => layoutA.columnCount - layoutB.columnCount);
      // Fallback to biggest if none exists with columnCount bigger than addedLayout.columnCount
      const layoutToClone =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sortedLayouts.find((layout) => layout.columnCount >= addedLayout.columnCount) ?? sortedLayouts.at(-1)!;

      const updatedBoardLayout = getUpdatedBoardLayout(board, {
        previous: {
          layoutId: layoutToClone.id,
          columnCount: layoutToClone.columnCount,
        },
        current: {
          layoutId,
          columnCount: addedLayout.columnCount,
        },
      });

      itemSectionLayoutsToInsert.push(...updatedBoardLayout.itemSectionLayouts);
      sectionLayoutsToInsert.push(...updatedBoardLayout.sectionLayouts);
    }

    if (layoutsToInsert.length > 0) {
      await ctx.db.insert(layouts).values(layoutsToInsert);
    }

    if (itemSectionLayoutsToInsert.length > 0) {
      await ctx.db.insert(itemLayouts).values(itemSectionLayoutsToInsert);
    }

    if (sectionLayoutsToInsert.length > 0) {
      await ctx.db.insert(sectionLayouts).values(sectionLayoutsToInsert);
    }

    const updatedLayouts = filterUpdatedItems(input.layouts, board.layouts);
    for (const updatedLayout of updatedLayouts) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const dbLayout = board.layouts.find((layout) => layout.id === updatedLayout.id)!;

      if (dbLayout.columnCount !== updatedLayout.columnCount) {
        const updatedBoardLayout = getUpdatedBoardLayout(board, {
          previous: {
            layoutId: dbLayout.id,
            columnCount: dbLayout.columnCount,
          },
          current: {
            layoutId: dbLayout.id,
            columnCount: updatedLayout.columnCount,
          },
        });

        for (const itemSectionLayout of updatedBoardLayout.itemSectionLayouts) {
          await ctx.db
            .update(itemLayouts)
            .set({
              height: itemSectionLayout.height,
              width: itemSectionLayout.width,
              xOffset: itemSectionLayout.xOffset,
              yOffset: itemSectionLayout.yOffset,
              sectionId: itemSectionLayout.sectionId,
            })
            .where(
              and(
                eq(itemLayouts.itemId, itemSectionLayout.itemId),
                eq(itemLayouts.layoutId, itemSectionLayout.layoutId),
              ),
            );
        }

        for (const sectionLayout of updatedBoardLayout.sectionLayouts) {
          await ctx.db
            .update(sectionLayouts)
            .set({
              height: sectionLayout.height,
              width: sectionLayout.width,
              xOffset: sectionLayout.xOffset,
              yOffset: sectionLayout.yOffset,
              parentSectionId: sectionLayout.parentSectionId,
            })
            .where(
              and(
                eq(sectionLayouts.sectionId, sectionLayout.sectionId),
                eq(sectionLayouts.layoutId, sectionLayout.layoutId),
              ),
            );
        }
      }

      await ctx.db
        .update(layouts)
        .set({
          name: updatedLayout.name,
          columnCount: updatedLayout.columnCount,
          breakpoint: updatedLayout.breakpoint,
        })
        .where(eq(layouts.id, updatedLayout.id));
    }

    const removedLayouts = filterRemovedItems(input.layouts, board.layouts);
    const removedLayoutIds = removedLayouts.map((layout) => layout.id);
    if (removedLayoutIds.length > 0) {
      await ctx.db.delete(layouts).where(inArray(layouts.id, removedLayoutIds));
    }
  }),
  savePartialBoardSettings: protectedProcedure
    .input(boardSavePartialSettingsSchema.and(z.object({ id: z.string() })))
    .mutation(async ({ ctx, input }) => {
      await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "modify");

      await ctx.db
        .update(boards)
        .set({
          // general settings
          pageTitle: input.pageTitle,
          metaTitle: input.metaTitle,
          logoImageUrl: input.logoImageUrl,
          faviconImageUrl: input.faviconImageUrl,

          // background settings
          backgroundImageUrl: input.backgroundImageUrl,
          backgroundImageAttachment: input.backgroundImageAttachment,
          backgroundImageRepeat: input.backgroundImageRepeat,
          backgroundImageSize: input.backgroundImageSize,

          // appearance settings
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
          opacity: input.opacity,
          iconColor: input.iconColor,
          itemRadius: input.itemRadius,

          // custom css
          customCss: input.customCss,

          // Behavior settings
          disableStatus: input.disableStatus,
        })
        .where(eq(boards.id, input.id));
    }),
  saveBoard: protectedProcedure.input(boardSaveSchema).mutation(async ({ input, ctx }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "modify");

    const dbBoard = await getFullBoardWithWhereAsync(ctx.db, eq(boards.id, input.id), ctx.session.user.id);

    await handleTransactionsAsync(ctx.db, {
      async handleAsync(db, schema) {
        await db.transaction(async (transaction) => {
          const addedSections = filterAddedItems(input.sections, dbBoard.sections);

          if (addedSections.length > 0) {
            await transaction.insert(schema.sections).values(
              addedSections.map((section) => ({
                id: section.id,
                kind: section.kind,
                yOffset: section.kind !== "dynamic" ? section.yOffset : null,
                xOffset: section.kind === "dynamic" ? null : 0,
                options: section.kind === "dynamic" ? superjson.stringify(section.options) : emptySuperJSON,
                name: "name" in section ? section.name : null,
                boardId: dbBoard.id,
              })),
            );

            if (addedSections.some((section) => section.kind === "dynamic")) {
              await transaction.insert(schema.sectionLayouts).values(
                addedSections
                  .filter((section) => section.kind === "dynamic")
                  .flatMap((section) =>
                    section.layouts.map(
                      (sectionLayout): InferInsertModel<typeof schema.sectionLayouts> => ({
                        layoutId: sectionLayout.layoutId,
                        sectionId: section.id,
                        parentSectionId: sectionLayout.parentSectionId,
                        height: sectionLayout.height,
                        width: sectionLayout.width,
                        xOffset: sectionLayout.xOffset,
                        yOffset: sectionLayout.yOffset,
                      }),
                    ),
                  ),
              );
            }
          }

          const addedItems = filterAddedItems(input.items, dbBoard.items);

          if (addedItems.length > 0) {
            await transaction.insert(schema.items).values(
              addedItems.map((item) => ({
                id: item.id,
                kind: item.kind,
                options: superjson.stringify(item.options),
                advancedOptions: superjson.stringify(item.advancedOptions),
                boardId: dbBoard.id,
              })),
            );
            await transaction.insert(schema.itemLayouts).values(
              addedItems.flatMap((item) =>
                item.layouts.map(
                  (layoutSection): InferInsertModel<typeof schema.itemLayouts> => ({
                    layoutId: layoutSection.layoutId,
                    sectionId: layoutSection.sectionId,
                    itemId: item.id,
                    height: layoutSection.height,
                    width: layoutSection.width,
                    xOffset: layoutSection.xOffset,
                    yOffset: layoutSection.yOffset,
                  }),
                ),
              ),
            );
          }

          const inputIntegrationRelations = input.items.flatMap(({ integrationIds, id: itemId }) =>
            integrationIds.map((integrationId) => ({
              integrationId,
              itemId,
            })),
          );
          const dbIntegrationRelations = dbBoard.items.flatMap(({ integrationIds, id: itemId }) =>
            integrationIds.map((integrationId) => ({
              integrationId,
              itemId,
            })),
          );
          const addedIntegrationRelations = inputIntegrationRelations.filter(
            (inputRelation) =>
              !dbIntegrationRelations.some(
                (dbRelation) =>
                  dbRelation.itemId === inputRelation.itemId &&
                  dbRelation.integrationId === inputRelation.integrationId,
              ),
          );

          if (addedIntegrationRelations.length > 0) {
            await transaction.insert(schema.integrationItems).values(
              addedIntegrationRelations.map((relation) => ({
                itemId: relation.itemId,
                integrationId: relation.integrationId,
              })),
            );
          }

          const updatedItems = filterUpdatedItems(input.items, dbBoard.items);

          for (const item of updatedItems) {
            await transaction
              .update(schema.items)
              .set({
                kind: item.kind,
                options: superjson.stringify(item.options),
                advancedOptions: superjson.stringify(item.advancedOptions),
              })
              .where(eq(schema.items.id, item.id));

            for (const itemSectionLayout of item.layouts) {
              await transaction
                .update(schema.itemLayouts)
                .set({
                  height: itemSectionLayout.height,
                  width: itemSectionLayout.width,
                  xOffset: itemSectionLayout.xOffset,
                  yOffset: itemSectionLayout.yOffset,
                  sectionId: itemSectionLayout.sectionId,
                })
                .where(
                  and(
                    eq(schema.itemLayouts.itemId, item.id),
                    eq(schema.itemLayouts.layoutId, itemSectionLayout.layoutId),
                  ),
                );
            }
          }

          const updatedSections = filterUpdatedItems(input.sections, dbBoard.sections);

          for (const section of updatedSections) {
            const prev = dbBoard.sections.find((dbSection) => dbSection.id === section.id);
            await transaction
              .update(schema.sections)
              .set({
                yOffset: prev?.kind !== "dynamic" && "yOffset" in section ? section.yOffset : null,
                xOffset: prev?.kind !== "dynamic" && "yOffset" in section ? 0 : null,
                options: section.kind === "dynamic" ? superjson.stringify(section.options) : emptySuperJSON,
                name: prev?.kind === "category" && "name" in section ? section.name : null,
              })
              .where(eq(schema.sections.id, section.id));

            if (section.kind !== "dynamic") continue;

            for (const sectionLayout of section.layouts) {
              await transaction
                .update(schema.sectionLayouts)
                .set({
                  height: sectionLayout.height,
                  width: sectionLayout.width,
                  xOffset: sectionLayout.xOffset,
                  yOffset: sectionLayout.yOffset,
                  parentSectionId: sectionLayout.parentSectionId,
                })
                .where(
                  and(
                    eq(schema.sectionLayouts.sectionId, section.id),
                    eq(schema.sectionLayouts.layoutId, sectionLayout.layoutId),
                  ),
                );
            }
          }

          const removedIntegrationRelations = dbIntegrationRelations.filter(
            (dbRelation) =>
              !inputIntegrationRelations.some(
                (inputRelation) =>
                  dbRelation.itemId === inputRelation.itemId &&
                  dbRelation.integrationId === inputRelation.integrationId,
              ),
          );

          for (const relation of removedIntegrationRelations) {
            await transaction
              .delete(schema.integrationItems)
              .where(
                and(
                  eq(integrationItems.itemId, relation.itemId),
                  eq(integrationItems.integrationId, relation.integrationId),
                ),
              );
          }

          const removedItems = filterRemovedItems(input.items, dbBoard.items);

          const itemIds = removedItems.map((item) => item.id);
          if (itemIds.length > 0) {
            await transaction.delete(schema.items).where(inArray(schema.items.id, itemIds));
          }

          const removedSections = filterRemovedItems(input.sections, dbBoard.sections);
          const sectionIds = removedSections.map((section) => section.id);

          if (sectionIds.length > 0) {
            await transaction.delete(schema.sections).where(inArray(schema.sections.id, sectionIds));
          }
        });
      },
      handleSync(db) {
        db.transaction((transaction) => {
          const addedSections = filterAddedItems(input.sections, dbBoard.sections);

          if (addedSections.length > 0) {
            transaction
              .insert(sections)
              .values(
                addedSections.map((section) => ({
                  id: section.id,
                  kind: section.kind,
                  yOffset: section.kind !== "dynamic" ? section.yOffset : null,
                  xOffset: section.kind === "dynamic" ? null : 0,
                  options: section.kind === "dynamic" ? superjson.stringify(section.options) : emptySuperJSON,
                  name: "name" in section ? section.name : null,
                  boardId: dbBoard.id,
                })),
              )
              .run();

            if (addedSections.some((section) => section.kind === "dynamic")) {
              transaction
                .insert(sectionLayouts)
                .values(
                  addedSections
                    .filter((section) => section.kind === "dynamic")
                    .flatMap((section) =>
                      section.layouts.map(
                        (sectionLayout): InferInsertModel<typeof sectionLayouts> => ({
                          layoutId: sectionLayout.layoutId,
                          sectionId: section.id,
                          parentSectionId: sectionLayout.parentSectionId,
                          height: sectionLayout.height,
                          width: sectionLayout.width,
                          xOffset: sectionLayout.xOffset,
                          yOffset: sectionLayout.yOffset,
                        }),
                      ),
                    ),
                )
                .run();
            }
          }

          const addedItems = filterAddedItems(input.items, dbBoard.items);

          if (addedItems.length > 0) {
            transaction
              .insert(items)
              .values(
                addedItems.map((item) => ({
                  id: item.id,
                  kind: item.kind,
                  options: superjson.stringify(item.options),
                  advancedOptions: superjson.stringify(item.advancedOptions),
                  boardId: dbBoard.id,
                })),
              )
              .run();
            transaction
              .insert(itemLayouts)
              .values(
                addedItems.flatMap((item) =>
                  item.layouts.map(
                    (layoutSection): InferInsertModel<typeof itemLayouts> => ({
                      layoutId: layoutSection.layoutId,
                      sectionId: layoutSection.sectionId,
                      itemId: item.id,
                      height: layoutSection.height,
                      width: layoutSection.width,
                      xOffset: layoutSection.xOffset,
                      yOffset: layoutSection.yOffset,
                    }),
                  ),
                ),
              )
              .run();
          }

          const inputIntegrationRelations = input.items.flatMap(({ integrationIds, id: itemId }) =>
            integrationIds.map((integrationId) => ({
              integrationId,
              itemId,
            })),
          );
          const dbIntegrationRelations = dbBoard.items.flatMap(({ integrationIds, id: itemId }) =>
            integrationIds.map((integrationId) => ({
              integrationId,
              itemId,
            })),
          );
          const addedIntegrationRelations = inputIntegrationRelations.filter(
            (inputRelation) =>
              !dbIntegrationRelations.some(
                (dbRelation) =>
                  dbRelation.itemId === inputRelation.itemId &&
                  dbRelation.integrationId === inputRelation.integrationId,
              ),
          );

          if (addedIntegrationRelations.length > 0) {
            transaction
              .insert(integrationItems)
              .values(
                addedIntegrationRelations.map((relation) => ({
                  itemId: relation.itemId,
                  integrationId: relation.integrationId,
                })),
              )
              .run();
          }

          const updatedItems = filterUpdatedItems(input.items, dbBoard.items);

          for (const item of updatedItems) {
            transaction
              .update(items)
              .set({
                kind: item.kind,
                options: superjson.stringify(item.options),
                advancedOptions: superjson.stringify(item.advancedOptions),
              })
              .where(eq(items.id, item.id))
              .run();

            for (const itemSectionLayout of item.layouts) {
              transaction
                .update(itemLayouts)
                .set({
                  height: itemSectionLayout.height,
                  width: itemSectionLayout.width,
                  xOffset: itemSectionLayout.xOffset,
                  yOffset: itemSectionLayout.yOffset,
                  sectionId: itemSectionLayout.sectionId,
                })
                .where(and(eq(itemLayouts.itemId, item.id), eq(itemLayouts.layoutId, itemSectionLayout.layoutId)))
                .run();
            }
          }

          const updatedSections = filterUpdatedItems(input.sections, dbBoard.sections);

          for (const section of updatedSections) {
            const prev = dbBoard.sections.find((dbSection) => dbSection.id === section.id);
            transaction
              .update(sections)
              .set({
                yOffset: prev?.kind !== "dynamic" && "yOffset" in section ? section.yOffset : null,
                xOffset: prev?.kind !== "dynamic" && "yOffset" in section ? 0 : null,
                options: section.kind === "dynamic" ? superjson.stringify(section.options) : emptySuperJSON,
                name: prev?.kind === "category" && "name" in section ? section.name : null,
              })
              .where(eq(sections.id, section.id))
              .run();

            if (section.kind !== "dynamic") continue;

            for (const sectionLayout of section.layouts) {
              transaction
                .update(sectionLayouts)
                .set({
                  height: sectionLayout.height,
                  width: sectionLayout.width,
                  xOffset: sectionLayout.xOffset,
                  yOffset: sectionLayout.yOffset,
                  parentSectionId: sectionLayout.parentSectionId,
                })
                .where(
                  and(eq(sectionLayouts.sectionId, section.id), eq(sectionLayouts.layoutId, sectionLayout.layoutId)),
                )
                .run();
            }
          }

          const removedIntegrationRelations = dbIntegrationRelations.filter(
            (dbRelation) =>
              !inputIntegrationRelations.some(
                (inputRelation) =>
                  dbRelation.itemId === inputRelation.itemId &&
                  dbRelation.integrationId === inputRelation.integrationId,
              ),
          );

          for (const relation of removedIntegrationRelations) {
            transaction
              .delete(integrationItems)
              .where(
                and(
                  eq(integrationItems.itemId, relation.itemId),
                  eq(integrationItems.integrationId, relation.integrationId),
                ),
              )
              .run();
          }

          const removedItems = filterRemovedItems(input.items, dbBoard.items);

          const itemIds = removedItems.map((item) => item.id);
          if (itemIds.length > 0) {
            transaction.delete(items).where(inArray(items.id, itemIds)).run();
          }

          const removedSections = filterRemovedItems(input.sections, dbBoard.sections);
          const sectionIds = removedSections.map((section) => section.id);

          if (sectionIds.length > 0) {
            transaction.delete(sections).where(inArray(sections.id, sectionIds)).run();
          }
        });
      },
    });
  }),
  getBoardPermissions: protectedProcedure.input(byIdSchema).query(async ({ input, ctx }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.id), "full");

    const dbGroupPermissions = await ctx.db.query.groupPermissions.findMany({
      where: inArray(
        groupPermissions.permission,
        getPermissionsWithParents(["board-view-all", "board-modify-all", "board-full-all"]),
      ),
      columns: {
        groupId: false,
      },
      with: {
        group: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    const userPermissions = await ctx.db.query.boardUserPermissions.findMany({
      where: eq(boardUserPermissions.boardId, input.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    const dbGroupBoardPermission = await ctx.db.query.boardGroupPermissions.findMany({
      where: eq(boardGroupPermissions.boardId, input.id),
      with: {
        group: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      inherited: dbGroupPermissions.sort((permissionA, permissionB) => {
        return permissionA.group.name.localeCompare(permissionB.group.name);
      }),
      users: userPermissions
        .map(({ user, permission }) => ({
          user,
          permission,
        }))
        .sort((permissionA, permissionB) => {
          return (permissionA.user.name ?? "").localeCompare(permissionB.user.name ?? "");
        }),
      groups: dbGroupBoardPermission
        .map(({ group, permission }) => ({
          group: {
            id: group.id,
            name: group.name,
          },
          permission,
        }))
        .sort((permissionA, permissionB) => {
          return permissionA.group.name.localeCompare(permissionB.group.name);
        }),
    };
  }),
  saveUserBoardPermissions: protectedProcedure.input(boardSavePermissionsSchema).mutation(async ({ input, ctx }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.entityId), "full");

    await handleTransactionsAsync(ctx.db, {
      async handleAsync(db, schema) {
        await db.transaction(async (transaction) => {
          await transaction.delete(schema.boardUserPermissions).where(eq(boardUserPermissions.boardId, input.entityId));
          if (input.permissions.length === 0) {
            return;
          }
          await transaction.insert(schema.boardUserPermissions).values(
            input.permissions.map((permission) => ({
              userId: permission.principalId,
              permission: permission.permission,
              boardId: input.entityId,
            })),
          );
        });
      },
      handleSync(db) {
        db.transaction((transaction) => {
          transaction.delete(boardUserPermissions).where(eq(boardUserPermissions.boardId, input.entityId)).run();
          if (input.permissions.length === 0) {
            return;
          }
          transaction
            .insert(boardUserPermissions)
            .values(
              input.permissions.map((permission) => ({
                userId: permission.principalId,
                permission: permission.permission,
                boardId: input.entityId,
              })),
            )
            .run();
        });
      },
    });
  }),
  saveGroupBoardPermissions: protectedProcedure.input(boardSavePermissionsSchema).mutation(async ({ input, ctx }) => {
    await throwIfActionForbiddenAsync(ctx, eq(boards.id, input.entityId), "full");

    await handleTransactionsAsync(ctx.db, {
      async handleAsync(db, schema) {
        await db.transaction(async (transaction) => {
          await transaction
            .delete(schema.boardGroupPermissions)
            .where(eq(boardGroupPermissions.boardId, input.entityId));
          if (input.permissions.length === 0) {
            return;
          }
          await transaction.insert(schema.boardGroupPermissions).values(
            input.permissions.map((permission) => ({
              groupId: permission.principalId,
              permission: permission.permission,
              boardId: input.entityId,
            })),
          );
        });
      },
      handleSync(db) {
        db.transaction((transaction) => {
          transaction.delete(boardGroupPermissions).where(eq(boardGroupPermissions.boardId, input.entityId)).run();
          if (input.permissions.length === 0) {
            return;
          }
          transaction
            .insert(boardGroupPermissions)
            .values(
              input.permissions.map((permission) => ({
                groupId: permission.principalId,
                permission: permission.permission,
                boardId: input.entityId,
              })),
            )
            .run();
        });
      },
    });
  }),
  importOldmarrConfig: permissionRequiredProcedure
    .requiresPermission("board-create")
    .input(importJsonFileSchema)
    .mutation(async ({ input, ctx }) => {
      const content = await input.file.text();
      const oldmarr = oldmarrConfigSchema.parse(JSON.parse(content));
      await importOldmarrAsync(ctx.db, oldmarr, input.configuration);
    }),
});

/**
 * Get the home board id of the user with the given device type
 * For an example of a user with deviceType = 'mobile' it would go through the following order:
 * 1. user.mobileHomeBoardId
 * 2. user.homeBoardId
 * 3. group.mobileHomeBoardId of the lowest positions group
 * 4. group.homeBoardId of the lowest positions group
 * 5. everyoneGroup.mobileHomeBoardId
 * 6. everyoneGroup.homeBoardId
 * 7. serverSettings.mobileHomeBoardId
 * 8. serverSettings.homeBoardId
 * 9. show NOT_FOUND error
 */
const getHomeIdBoardAsync = async (
  db: Database,
  user: InferSelectModel<typeof users> | null,
  deviceType: DeviceType,
) => {
  const settingKey = deviceType === "mobile" ? "mobileHomeBoardId" : "homeBoardId";

  if (!user) {
    const boardSettings = await getServerSettingByKeyAsync(db, "board");
    return boardSettings[settingKey] ?? boardSettings.homeBoardId;
  }

  if (user[settingKey]) return user[settingKey];
  if (user.homeBoardId) return user.homeBoardId;

  const lowestGroupExceptEveryone = await db
    .select({
      homeBoardId: groups.homeBoardId,
      mobileHomeBoardId: groups.mobileHomeBoardId,
    })
    .from(groups)
    .leftJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(
      and(
        eq(groupMembers.userId, user.id),
        not(eq(groups.name, everyoneGroup)),
        not(isNull(groups[settingKey])),
        not(isNull(groups.homeBoardId)),
      ),
    )
    .orderBy(asc(groups.position))
    .limit(1)
    .then((result) => result[0]);

  if (lowestGroupExceptEveryone?.[settingKey]) return lowestGroupExceptEveryone[settingKey];
  if (lowestGroupExceptEveryone?.homeBoardId) return lowestGroupExceptEveryone.homeBoardId;

  const dbEveryoneGroup = await db.query.groups.findFirst({
    where: eq(groups.name, everyoneGroup),
  });

  if (dbEveryoneGroup?.[settingKey]) return dbEveryoneGroup[settingKey];
  if (dbEveryoneGroup?.homeBoardId) return dbEveryoneGroup.homeBoardId;

  const boardSettings = await getServerSettingByKeyAsync(db, "board");
  return boardSettings[settingKey] ?? boardSettings.homeBoardId;
};

const noBoardWithSimilarNameAsync = async (db: Database, name: string, ignoredIds: string[] = []) => {
  const boards = await db.query.boards.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  const board = boards.find(
    (board) => board.name.toLowerCase() === name.toLowerCase() && !ignoredIds.includes(board.id),
  );

  if (board) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Board with similar name already exists",
    });
  }
};

const getUpdatedBoardLayout = (
  board: Awaited<ReturnType<typeof getFullBoardWithWhereAsync>>,
  options: {
    previous: {
      layoutId: string;
      columnCount: number;
    };
    current: {
      layoutId: string;
      columnCount: number;
    };
  },
) => {
  const itemSectionLayoutsCollection: InferInsertModel<typeof itemLayouts>[] = [];
  const sectionLayoutsCollection: InferInsertModel<typeof sectionLayouts>[] = [];

  const elements = getElementsForLayout(board, options.previous.layoutId);
  const rootSections = board.sections.filter((section) => section.kind !== "dynamic");

  for (const rootSection of rootSections) {
    const result = generateResponsiveGridFor({
      items: elements,
      previousWidth: options.previous.columnCount,
      width: options.current.columnCount,
      sectionId: rootSection.id,
    });

    itemSectionLayoutsCollection.push(
      ...board.items
        .map((item): InferInsertModel<typeof itemLayouts> | null => {
          const currentElement = result.items.find((element) => element.type === "item" && element.id === item.id);

          if (!currentElement) {
            return null;
          }

          return {
            itemId: item.id,
            layoutId: options.current.layoutId,
            sectionId: currentElement.sectionId,
            height: currentElement.height,
            width: currentElement.width,
            xOffset: currentElement.xOffset,
            yOffset: currentElement.yOffset,
          };
        })
        .filter((item) => item !== null),
    );

    sectionLayoutsCollection.push(
      ...board.sections
        .filter((section) => section.kind === "dynamic")
        .map((section): InferInsertModel<typeof sectionLayouts> | null => {
          const currentElement = result.items.find(
            (element) => element.type === "section" && element.id === section.id,
          );

          if (!currentElement) {
            return null;
          }

          return {
            layoutId: options.current.layoutId,
            sectionId: section.id,
            parentSectionId: currentElement.sectionId,
            height: currentElement.height,
            width: currentElement.width,
            xOffset: currentElement.xOffset,
            yOffset: currentElement.yOffset,
          };
        })
        .filter((section) => section !== null),
    );
  }

  return {
    itemSectionLayouts: itemSectionLayoutsCollection,
    sectionLayouts: sectionLayoutsCollection,
  };
};

const getElementsForLayout = (board: Awaited<ReturnType<typeof getFullBoardWithWhereAsync>>, layoutId: string) => {
  const sectionElements = board.sections
    .filter((section) => section.kind === "dynamic")
    .map((section) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const clonedLayout = section.layouts.find((sectionLayout) => sectionLayout.layoutId === layoutId)!;

      return {
        id: section.id,
        type: "section" as const,
        height: clonedLayout.height,
        width: clonedLayout.width,
        xOffset: clonedLayout.xOffset,
        yOffset: clonedLayout.yOffset,
        sectionId: clonedLayout.parentSectionId,
      };
    });

  const itemElements = board.items.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const clonedLayout = item.layouts.find((itemLayout) => itemLayout.layoutId === layoutId)!;

    return {
      id: item.id,
      type: "item" as const,
      height: clonedLayout.height,
      width: clonedLayout.width,
      xOffset: clonedLayout.xOffset,
      yOffset: clonedLayout.yOffset,
      sectionId: clonedLayout.sectionId,
    };
  });

  return [...itemElements, ...sectionElements];
};

const getFullBoardWithWhereAsync = async (db: Database, where: SQL<unknown>, userId: string | null) => {
  const groupsOfCurrentUser = await db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, userId ?? ""),
  });
  const board = await db.query.boards.findFirst({
    where,
    with: {
      creator: {
        columns: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
      },
      sections: {
        with: {
          collapseStates: {
            where: eq(sectionCollapseStates.userId, userId ?? ""),
          },
          layouts: true,
        },
      },
      items: {
        with: {
          integrations: {
            with: {
              integration: true,
            },
          },
          layouts: true,
        },
      },
      layouts: true,
      userPermissions: {
        where: eq(boardUserPermissions.userId, userId ?? ""),
        columns: {
          permission: true,
        },
      },
      groupPermissions: {
        where: inArray(boardGroupPermissions.groupId, groupsOfCurrentUser.map((group) => group.groupId).concat("")),
      },
    },
  });

  if (!board) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Board not found",
    });
  }

  const { sections, items, layouts, ...otherBoardProperties } = board;

  return {
    ...otherBoardProperties,
    layouts: layouts
      .map(({ boardId: _, ...layout }) => layout)
      .sort((layoutA, layoutB) => layoutA.breakpoint - layoutB.breakpoint),
    sections: sections.map(({ collapseStates, ...section }) =>
      parseSection({
        ...section,
        xOffset: section.xOffset,
        yOffset: section.yOffset,
        options: superjson.parse(section.options ?? emptySuperJSON),
        layouts: section.layouts.map((layout) => ({
          xOffset: layout.xOffset,
          yOffset: layout.yOffset,
          width: layout.width,
          height: layout.height,
          parentSectionId: layout.parentSectionId,
          layoutId: layout.layoutId,
        })),
        collapsed: collapseStates.at(0)?.collapsed ?? false,
      }),
    ),
    items: items.map(({ integrations: itemIntegrations, ...item }) =>
      parseItem({
        ...item,
        layouts: item.layouts.map((layout) => ({
          xOffset: layout.xOffset,
          yOffset: layout.yOffset,
          width: layout.width,
          height: layout.height,
          layoutId: layout.layoutId,
          sectionId: layout.sectionId,
        })),
        integrationIds: itemIntegrations.map((item) => item.integration.id),
        advancedOptions: superjson.parse<BoardItemAdvancedOptions>(item.advancedOptions),
        options: superjson.parse<Record<string, unknown>>(item.options),
      }),
    ),
  };
};

const forKind = <T extends WidgetKind>(kind: T) =>
  z.object({
    kind: z.literal(kind),
    options: z.record(z.string(), z.unknown()),
  });

const outputItemSchema = zodUnionFromArray(widgetKinds.map((kind) => forKind(kind))).and(sharedItemSchema);

const parseItem = (item: unknown) => {
  const result = outputItemSchema.safeParse(item);

  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
};

const parseSection = (section: unknown) => {
  const result = sectionSchema.safeParse(section);

  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
};

const filterAddedItems = <TInput extends { id: string }>(inputArray: TInput[], dbArray: TInput[]) =>
  inputArray.filter((inputItem) => !dbArray.some((dbItem) => dbItem.id === inputItem.id));

const filterRemovedItems = <TInput extends { id: string }>(inputArray: TInput[], dbArray: TInput[]) =>
  dbArray.filter((dbItem) => !inputArray.some((inputItem) => dbItem.id === inputItem.id));

const filterUpdatedItems = <TInput extends { id: string }>(inputArray: TInput[], dbArray: TInput[]) =>
  inputArray.filter((inputItem) => dbArray.some((dbItem) => dbItem.id === inputItem.id));
