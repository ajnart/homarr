import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";

import { getIntegrationKindsByCategory } from "@homarr/definitions";
import { createIntegrationAsync } from "@homarr/integrations";
import type { Indexer } from "@homarr/integrations/types";
import { indexerManagerRequestHandler } from "@homarr/request-handler/indexer-manager";

import type { IntegrationAction } from "../../middlewares/integration";
import { createManyIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";

const createIndexerManagerIntegrationMiddleware = (action: IntegrationAction) =>
  createManyIntegrationMiddleware(action, ...getIntegrationKindsByCategory("indexerManager"));

export const indexerManagerRouter = createTRPCRouter({
  getIndexersStatus: publicProcedure
    .concat(createIndexerManagerIntegrationMiddleware("query"))
    .query(async ({ ctx }) => {
      const results = await Promise.all(
        ctx.integrations.map(async (integration) => {
          const innerHandler = indexerManagerRequestHandler.handler(integration, {});
          const { data: indexers } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });

          return {
            integrationId: integration.id,
            indexers,
          };
        }),
      );
      return results;
    }),

  subscribeIndexersStatus: publicProcedure
    .concat(createIndexerManagerIntegrationMiddleware("query"))
    .subscription(({ ctx }) => {
      return observable<{ integrationId: string; indexers: Indexer[] }>((emit) => {
        const unsubscribes: (() => void)[] = [];
        for (const integrationWithSecrets of ctx.integrations) {
          const innerHandler = indexerManagerRequestHandler.handler(integrationWithSecrets, {});
          const unsubscribe = innerHandler.subscribe((indexers) => {
            emit.next({
              integrationId: integrationWithSecrets.id,
              indexers,
            });
          });
          unsubscribes.push(unsubscribe);
        }
        return () => {
          unsubscribes.forEach((unsubscribe) => {
            unsubscribe();
          });
        };
      });
    }),
  testAllIndexers: protectedProcedure
    .concat(createIndexerManagerIntegrationMiddleware("interact"))
    .mutation(async ({ ctx }) => {
      await Promise.all(
        ctx.integrations.map(async (integration) => {
          const client = await createIntegrationAsync(integration);
          await client.testAllAsync().catch((err) => {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to test all indexers for ${integration.name} (${integration.id})`,
              cause: err,
            });
          });
        }),
      );
    }),
});
