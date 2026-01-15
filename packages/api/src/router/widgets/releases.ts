import { escapeForRegEx } from "@tiptap/react";
import { z } from "zod/v4";

import { getIntegrationKindsByCategory } from "@homarr/definitions";
import { releasesRequestHandler } from "@homarr/request-handler/releases";

import { createOneIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, publicProcedure } from "../../trpc";

const formatVersionFilterRegex = (versionFilter: z.infer<typeof releaseVersionFilterSchema> | undefined) => {
  if (!versionFilter) return undefined;

  const escapedPrefix = versionFilter.prefix ? escapeForRegEx(versionFilter.prefix) : "";
  const precision = "[0-9]+\\.".repeat(versionFilter.precision).slice(0, -2);
  const escapedSuffix = versionFilter.suffix ? escapeForRegEx(versionFilter.suffix) : "";

  return `^${escapedPrefix}${precision}${escapedSuffix}$`;
};

const releaseVersionFilterSchema = z.object({
  prefix: z.string().optional(),
  precision: z.number(),
  suffix: z.string().optional(),
});

export const releasesRouter = createTRPCRouter({
  getLatest: publicProcedure
    .concat(createOneIntegrationMiddleware("query", ...getIntegrationKindsByCategory("releasesProvider")))
    .input(
      z.object({
        repositories: z.array(
          z.object({
            id: z.string(),
            identifier: z.string(),
            versionFilter: releaseVersionFilterSchema.optional(),
          }),
        ),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await Promise.all(
        input.repositories.map(async (repository) => {
          const response = await releasesRequestHandler
            .handler(ctx.integration, {
              id: repository.id,
              identifier: repository.identifier,
              versionRegex: formatVersionFilterRegex(repository.versionFilter),
            })
            .getCachedOrUpdatedDataAsync({
              forceUpdate: false,
            });

          return {
            id: repository.id,
            integration: { name: ctx.integration.name, kind: ctx.integration.kind },
            timestamp: response.timestamp,
            ...response.data,
          };
        }),
      );
    }),
});
