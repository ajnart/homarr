import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { createId } from "@homarr/common";
import type { Database } from "@homarr/db";
import { and, eq, handleTransactionsAsync, like, not } from "@homarr/db";
import { getMaxGroupPositionAsync } from "@homarr/db/queries";
import { groupMembers, groupPermissions, groups } from "@homarr/db/schema";
import { everyoneGroup } from "@homarr/definitions";
import { byIdSchema, paginatedSchema } from "@homarr/validation/common";
import {
  groupCreateSchema,
  groupSavePartialSettingsSchema,
  groupSavePermissionsSchema,
  groupSavePositionsSchema,
  groupUpdateSchema,
  groupUserSchema,
} from "@homarr/validation/group";

import { createTRPCRouter, onboardingProcedure, permissionRequiredProcedure, protectedProcedure } from "../trpc";
import { throwIfCredentialsDisabled } from "./invite/checks";
import { nextOnboardingStepAsync } from "./onboard/onboard-queries";

export const groupRouter = createTRPCRouter({
  getAll: permissionRequiredProcedure.requiresPermission("admin").query(async ({ ctx }) => {
    const dbGroups = await ctx.db.query.groups.findMany({
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return dbGroups.map((group) => ({
      ...group,
      members: group.members.map((member) => member.user),
    }));
  }),

  getPaginated: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(paginatedSchema)
    .query(async ({ input, ctx }) => {
      const whereQuery = input.search ? like(groups.name, `%${input.search.trim()}%`) : undefined;
      const groupCount = await ctx.db.$count(groups, whereQuery);

      const dbGroups = await ctx.db.query.groups.findMany({
        with: {
          members: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
        limit: input.pageSize,
        offset: (input.page - 1) * input.pageSize,
        where: whereQuery,
      });

      return {
        items: dbGroups.map((group) => ({
          ...group,
          members: group.members.map((member) => member.user),
        })),
        totalCount: groupCount,
      };
    }),
  getById: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(byIdSchema)
    .query(async ({ input, ctx }) => {
      const group = await ctx.db.query.groups.findFirst({
        where: eq(groups.id, input.id),
        with: {
          members: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  provider: true,
                },
              },
            },
          },
          permissions: {
            columns: {
              permission: true,
            },
          },
          owner: {
            columns: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return {
        ...group,
        members: group.members.map((member) => member.user),
        permissions: group.permissions.map((permission) => permission.permission),
      };
    }),
  // Is protected because also used in board access / integration access forms
  selectable: protectedProcedure
    .input(z.object({ withPermissions: z.boolean().default(false) }).optional())
    .query(async ({ ctx, input }) => {
      const withPermissions = input?.withPermissions && ctx.session.user.permissions.includes("admin");

      if (!withPermissions) {
        return await ctx.db.query.groups.findMany({
          columns: {
            id: true,
            name: true,
          },
        });
      }

      const groups = await ctx.db.query.groups.findMany({
        columns: {
          id: true,
          name: true,
        },
        with: { permissions: { columns: { permission: true } } },
      });

      return groups.map((group) => ({
        ...group,
        permissions: group.permissions.map((permission) => permission.permission),
      }));
    }),
  search: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(
      z.object({
        query: z.string(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.groups.findMany({
        where: like(groups.name, `%${input.query}%`),
        columns: {
          id: true,
          name: true,
        },
        limit: input.limit,
      });
    }),
  createInitialExternalGroup: onboardingProcedure
    .requiresStep("group")
    .input(groupCreateSchema)
    .mutation(async ({ input, ctx }) => {
      await checkSimilarNameAndThrowAsync(ctx.db, input.name);

      const maxPosition = await getMaxGroupPositionAsync(ctx.db);

      const groupId = createId();
      await ctx.db.insert(groups).values({
        id: groupId,
        name: input.name,
        position: maxPosition + 1,
      });

      await ctx.db.insert(groupPermissions).values({
        groupId,
        permission: "admin",
      });

      await nextOnboardingStepAsync(ctx.db, undefined);
    }),
  createGroup: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(groupCreateSchema)
    .mutation(async ({ input, ctx }) => {
      await checkSimilarNameAndThrowAsync(ctx.db, input.name);

      const maxPosition = await getMaxGroupPositionAsync(ctx.db);

      const id = createId();
      await ctx.db.insert(groups).values({
        id,
        name: input.name,
        position: maxPosition + 1,
        ownerId: ctx.session.user.id,
      });

      return id;
    }),
  updateGroup: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(groupUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      await throwIfGroupNotFoundAsync(ctx.db, input.id);
      await throwIfGroupNameIsReservedAsync(ctx.db, input.id);

      await checkSimilarNameAndThrowAsync(ctx.db, input.name, input.id);

      await ctx.db
        .update(groups)
        .set({
          name: input.name,
        })
        .where(eq(groups.id, input.id));
    }),
  savePartialSettings: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(groupSavePartialSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      await throwIfGroupNotFoundAsync(ctx.db, input.id);

      await ctx.db
        .update(groups)
        .set({
          homeBoardId: input.settings.homeBoardId,
          mobileHomeBoardId: input.settings.mobileHomeBoardId,
        })
        .where(eq(groups.id, input.id));
    }),
  savePositions: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(groupSavePositionsSchema)
    .mutation(async ({ input, ctx }) => {
      const positions = input.positions.map((id, index) => ({ id, position: index + 1 }));

      await handleTransactionsAsync(ctx.db, {
        handleAsync: async (db, schema) => {
          await db.transaction(async (trx) => {
            for (const { id, position } of positions) {
              await trx.update(schema.groups).set({ position }).where(eq(groups.id, id));
            }
          });
        },
        handleSync: (db) => {
          db.transaction((trx) => {
            for (const { id, position } of positions) {
              trx.update(groups).set({ position }).where(eq(groups.id, id)).run();
            }
          });
        },
      });
    }),
  savePermissions: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(groupSavePermissionsSchema)
    .mutation(async ({ input, ctx }) => {
      await throwIfGroupNotFoundAsync(ctx.db, input.groupId);

      await ctx.db.delete(groupPermissions).where(eq(groupPermissions.groupId, input.groupId));

      if (input.permissions.length > 0) {
        await ctx.db.insert(groupPermissions).values(
          input.permissions.map((permission) => ({
            groupId: input.groupId,
            permission,
          })),
        );
      }
    }),
  transferOwnership: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(groupUserSchema)
    .mutation(async ({ input, ctx }) => {
      await throwIfGroupNotFoundAsync(ctx.db, input.groupId);
      await throwIfGroupNameIsReservedAsync(ctx.db, input.groupId);

      await ctx.db
        .update(groups)
        .set({
          ownerId: input.userId,
        })
        .where(eq(groups.id, input.groupId));
    }),
  deleteGroup: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(byIdSchema)
    .mutation(async ({ input, ctx }) => {
      await throwIfGroupNotFoundAsync(ctx.db, input.id);
      await throwIfGroupNameIsReservedAsync(ctx.db, input.id);

      await ctx.db.delete(groups).where(eq(groups.id, input.id));
    }),
  addMember: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(groupUserSchema)
    .mutation(async ({ input, ctx }) => {
      await throwIfGroupNotFoundAsync(ctx.db, input.groupId);
      await throwIfGroupNameIsReservedAsync(ctx.db, input.groupId);
      throwIfCredentialsDisabled();

      const user = await ctx.db.query.users.findFirst({
        where: eq(groups.id, input.userId),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      await ctx.db.insert(groupMembers).values({
        groupId: input.groupId,
        userId: input.userId,
      });
    }),
  removeMember: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(groupUserSchema)
    .mutation(async ({ input, ctx }) => {
      await throwIfGroupNotFoundAsync(ctx.db, input.groupId);
      await throwIfGroupNameIsReservedAsync(ctx.db, input.groupId);
      throwIfCredentialsDisabled();

      await ctx.db
        .delete(groupMembers)
        .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, input.userId)));
    }),
});

const checkSimilarNameAndThrowAsync = async (db: Database, name: string, ignoreId?: string) => {
  const similar = await db.query.groups.findFirst({
    where: and(like(groups.name, `${name}`), not(eq(groups.id, ignoreId ?? ""))),
  });

  if (similar) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Found group with similar name",
    });
  }
};

const throwIfGroupNameIsReservedAsync = async (db: Database, id: string) => {
  const count = await db.$count(groups, and(eq(groups.id, id), eq(groups.name, everyoneGroup)));

  if (count > 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Action is forbidden for reserved group names",
    });
  }
};

const throwIfGroupNotFoundAsync = async (db: Database, id: string) => {
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, id),
  });

  if (!group) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Group not found",
    });
  }
};
