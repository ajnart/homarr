import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { createId } from "@homarr/common";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { asc, eq, like } from "@homarr/db";
import { getServerSettingByKeyAsync, updateServerSettingByKeyAsync } from "@homarr/db/queries";
import { searchEngines, users } from "@homarr/db/schema";
import { createIntegrationAsync } from "@homarr/integrations";
import { byIdSchema, paginatedSchema, searchSchema } from "@homarr/validation/common";
import { searchEngineEditSchema, searchEngineManageSchema } from "@homarr/validation/search-engine";
import { mediaRequestOptionsSchema, mediaRequestRequestSchema } from "@homarr/validation/widgets/media-request";

import { createOneIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, permissionRequiredProcedure, protectedProcedure, publicProcedure } from "../../trpc";

const logger = createLogger({ module: "searchEngineRouter" });

export const searchEngineRouter = createTRPCRouter({
  getPaginated: protectedProcedure.input(paginatedSchema).query(async ({ input, ctx }) => {
    const whereQuery = input.search ? like(searchEngines.name, `%${input.search.trim()}%`) : undefined;
    const searchEngineCount = await ctx.db.$count(searchEngines, whereQuery);

    const dbSearachEngines = await ctx.db.query.searchEngines.findMany({
      limit: input.pageSize,
      offset: (input.page - 1) * input.pageSize,
      where: whereQuery,
    });

    return {
      items: dbSearachEngines,
      totalCount: searchEngineCount,
    };
  }),
  getSelectable: protectedProcedure
    .input(z.object({ withIntegrations: z.boolean() }).default({ withIntegrations: true }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.searchEngines
        .findMany({
          orderBy: asc(searchEngines.name),
          where: input.withIntegrations ? undefined : eq(searchEngines.type, "generic"),
          columns: {
            id: true,
            name: true,
          },
        })
        .then((engines) => engines.map((engine) => ({ value: engine.id, label: engine.name })));
    }),

  byId: protectedProcedure.input(byIdSchema).query(async ({ ctx, input }) => {
    const searchEngine = await ctx.db.query.searchEngines.findFirst({
      where: eq(searchEngines.id, input.id),
    });

    if (!searchEngine) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Search engine not found",
      });
    }

    return searchEngine.type === "fromIntegration"
      ? {
          ...searchEngine,
          type: "fromIntegration" as const,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          integrationId: searchEngine.integrationId!,
        }
      : {
          ...searchEngine,
          type: "generic" as const,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          urlTemplate: searchEngine.urlTemplate!,
        };
  }),
  getDefaultSearchEngine: publicProcedure.query(async ({ ctx }) => {
    const userDefaultId = ctx.session?.user.id
      ? ((await ctx.db.query.users
          .findFirst({
            where: eq(users.id, ctx.session.user.id),
            columns: {
              defaultSearchEngineId: true,
            },
          })
          .then((user) => user?.defaultSearchEngineId)) ?? null)
      : null;

    if (userDefaultId) {
      return await ctx.db.query.searchEngines.findFirst({
        where: eq(searchEngines.id, userDefaultId),
        with: {
          integration: {
            columns: {
              kind: true,
              url: true,
              id: true,
            },
          },
        },
      });
    }

    const searchSettings = await getServerSettingByKeyAsync(ctx.db, "search");

    if (!searchSettings.defaultSearchEngineId) return null;

    const serverDefault = await ctx.db.query.searchEngines.findFirst({
      where: eq(searchEngines.id, searchSettings.defaultSearchEngineId),
      with: {
        integration: {
          columns: {
            kind: true,
            url: true,
            id: true,
          },
        },
      },
    });

    if (serverDefault) return serverDefault;

    // Remove the default search engine ID from settings if it does not longer exist
    try {
      await updateServerSettingByKeyAsync(ctx.db, "search", {
        ...searchSettings,
        defaultSearchEngineId: null,
      });
    } catch (error) {
      logger.warn(
        new Error("Failed to update search settings after default search engine not found", { cause: error }),
      );
    }

    return null;
  }),
  search: protectedProcedure.input(searchSchema).query(async ({ ctx, input }) => {
    return await ctx.db.query.searchEngines.findMany({
      where: like(searchEngines.short, `${input.query.toLowerCase().trim()}%`),
      with: {
        integration: {
          columns: {
            kind: true,
            url: true,
            id: true,
          },
        },
      },
      limit: input.limit,
    });
  }),
  getMediaRequestOptions: protectedProcedure
    .concat(createOneIntegrationMiddleware("query", "jellyseerr", "overseerr"))
    .input(mediaRequestOptionsSchema)
    .query(async ({ ctx, input }) => {
      const integration = await createIntegrationAsync(ctx.integration);
      return await integration.getSeriesInformationAsync(input.mediaType, input.mediaId);
    }),
  requestMedia: protectedProcedure
    .concat(createOneIntegrationMiddleware("interact", "jellyseerr", "overseerr"))
    .input(mediaRequestRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const integration = await createIntegrationAsync(ctx.integration);
      return await integration.requestMediaAsync(input.mediaType, input.mediaId, input.seasons);
    }),
  create: permissionRequiredProcedure
    .requiresPermission("search-engine-create")
    .input(searchEngineManageSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(searchEngines).values({
        id: createId(),
        name: input.name,
        short: input.short.toLowerCase(),
        iconUrl: input.iconUrl,
        urlTemplate: "urlTemplate" in input ? input.urlTemplate : null,
        description: input.description,
        type: input.type,
        integrationId: "integrationId" in input ? input.integrationId : null,
      });
    }),
  update: permissionRequiredProcedure
    .requiresPermission("search-engine-modify-all")
    .input(searchEngineEditSchema)
    .mutation(async ({ ctx, input }) => {
      const searchEngine = await ctx.db.query.searchEngines.findFirst({
        where: eq(searchEngines.id, input.id),
      });

      if (!searchEngine) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Search engine not found",
        });
      }

      await ctx.db
        .update(searchEngines)
        .set({
          name: input.name,
          iconUrl: input.iconUrl,
          urlTemplate: "urlTemplate" in input ? input.urlTemplate : null,
          description: input.description,
          integrationId: "integrationId" in input ? input.integrationId : null,
          type: input.type,
        })
        .where(eq(searchEngines.id, input.id));
    }),
  delete: permissionRequiredProcedure
    .requiresPermission("search-engine-full-all")
    .input(byIdSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          defaultSearchEngineId: null,
        })
        .where(eq(users.defaultSearchEngineId, input.id));
      await ctx.db.delete(searchEngines).where(eq(searchEngines.id, input.id));
    }),
});
