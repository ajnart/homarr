import { isProviderEnabled } from "@homarr/auth/server";
import { db, eq, inArray, or } from "@homarr/db";
import {
  apps,
  boards,
  boardUserPermissions,
  groupMembers,
  groups,
  integrations,
  invites,
  medias,
  searchEngines,
  users,
} from "@homarr/db/schema";
import type { TranslationObject } from "@homarr/translation";

import { createTRPCRouter, publicProcedure } from "../trpc";

interface HomeStatistic {
  titleKey: keyof TranslationObject["management"]["page"]["home"]["statistic"];
  subtitleKey: keyof TranslationObject["management"]["page"]["home"]["statisticLabel"];
  count: number;
  path: string;
}

export const homeRouter = createTRPCRouter({
  getStats: publicProcedure.query(async ({ ctx }) => {
    const isAdmin = ctx.session?.user.permissions.includes("admin") ?? false;
    const isCredentialsEnabled = isProviderEnabled("credentials");

    const statistics: HomeStatistic[] = [];

    const boardIds: string[] = [];
    if (ctx.session?.user && !ctx.session.user.permissions.includes("board-view-all")) {
      const permissionsOfCurrentUserWhenPresent = await ctx.db.query.boardUserPermissions.findMany({
        where: eq(boardUserPermissions.userId, ctx.session.user.id),
      });

      const permissionsOfCurrentUserGroupsWhenPresent = await ctx.db.query.groupMembers.findMany({
        where: eq(groupMembers.userId, ctx.session.user.id),
        with: {
          group: {
            with: {
              boardPermissions: {},
            },
          },
        },
      });

      boardIds.push(
        ...permissionsOfCurrentUserWhenPresent
          .map((permission) => permission.boardId)
          .concat(
            permissionsOfCurrentUserGroupsWhenPresent
              .map((groupMember) => groupMember.group.boardPermissions.map((permission) => permission.boardId))
              .flat(),
          ),
      );
    }

    statistics.push({
      titleKey: "board",
      subtitleKey: "boards",
      count: await db.$count(
        boards,
        ctx.session?.user.permissions.includes("board-view-all")
          ? undefined
          : or(
              eq(boards.isPublic, true),
              eq(boards.creatorId, ctx.session?.user.id ?? ""),
              boardIds.length > 0 ? inArray(boards.id, boardIds) : undefined,
            ),
      ),
      path: "/manage/boards",
    });

    if (isAdmin) {
      statistics.push({
        titleKey: "user",
        subtitleKey: "authentication",
        count: await db.$count(users),
        path: "/manage/users",
      });
    }

    if (isAdmin && isCredentialsEnabled) {
      statistics.push({
        titleKey: "invite",
        subtitleKey: "authentication",
        count: await db.$count(invites),
        path: "/manage/users/invites",
      });
    }

    if (ctx.session?.user.permissions.includes("integration-create")) {
      statistics.push({
        titleKey: "integration",
        subtitleKey: "resources",
        count: await db.$count(integrations),
        path: "/manage/integrations",
      });
    }

    if (ctx.session?.user) {
      statistics.push({
        titleKey: "app",
        subtitleKey: "resources",
        count: await db.$count(apps),
        path: "/manage/apps",
      });
    }

    if (isAdmin) {
      statistics.push({
        titleKey: "group",
        subtitleKey: "authorization",
        count: await db.$count(groups),
        path: "/manage/users/groups",
      });
    }

    if (ctx.session?.user.permissions.includes("search-engine-create")) {
      statistics.push({
        titleKey: "searchEngine",
        subtitleKey: "resources",
        count: await db.$count(searchEngines),
        path: "/manage/search-engines",
      });
    }

    if (ctx.session?.user.permissions.includes("media-upload")) {
      statistics.push({
        titleKey: "media",
        subtitleKey: "resources",
        count: await db.$count(
          medias,
          ctx.session.user.permissions.includes("media-view-all")
            ? undefined
            : eq(medias.creatorId, ctx.session.user.id),
        ),
        path: "/manage/medias",
      });
    }

    return statistics;
  }),
});
