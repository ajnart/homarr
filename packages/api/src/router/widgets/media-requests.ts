import { observable } from "@trpc/server/observable";
import { z } from "zod/v4";

import { getIntegrationKindsByCategory } from "@homarr/definitions";
import { createIntegrationAsync } from "@homarr/integrations";
import { mediaRequestStatusConfiguration } from "@homarr/integrations/types";
import type { MediaRequest } from "@homarr/integrations/types";
import { mediaRequestListRequestHandler } from "@homarr/request-handler/media-request-list";
import { mediaRequestStatsRequestHandler } from "@homarr/request-handler/media-request-stats";

import { createManyIntegrationMiddleware, createOneIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";

export const mediaRequestsRouter = createTRPCRouter({
  getLatestRequests: publicProcedure
    .concat(createManyIntegrationMiddleware("query", ...getIntegrationKindsByCategory("mediaRequest")))
    .query(async ({ ctx }) => {
      const results = await Promise.all(
        ctx.integrations.map(async (integration) => {
          const innerHandler = mediaRequestListRequestHandler.handler(integration, {});
          const { data } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });
          return {
            integration: {
              id: integration.id,
              name: integration.name,
              kind: integration.kind,
            },
            data,
          };
        }),
      );
      return results
        .flatMap(({ data, integration }) => data.map((request) => ({ ...request, integrationId: integration.id })))
        .sort((dataA, dataB) => {
          if (dataA.status === dataB.status) {
            return dataB.createdAt.getTime() - dataA.createdAt.getTime();
          }

          return (
            mediaRequestStatusConfiguration[dataA.status].position -
            mediaRequestStatusConfiguration[dataB.status].position
          );
        });
    }),
  subscribeToLatestRequests: publicProcedure
    .concat(createManyIntegrationMiddleware("query", ...getIntegrationKindsByCategory("mediaRequest")))
    .subscription(({ ctx }) => {
      return observable<{
        integrationId: string;
        requests: MediaRequest[];
      }>((emit) => {
        const unsubscribes: (() => void)[] = [];
        for (const integrationWithSecrets of ctx.integrations) {
          const { decryptedSecrets: _, ...integration } = integrationWithSecrets;
          const innerHandler = mediaRequestListRequestHandler.handler(integrationWithSecrets, {});
          const unsubscribe = innerHandler.subscribe((requests) => {
            emit.next({
              integrationId: integration.id,
              requests,
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
  getStats: publicProcedure
    .concat(createManyIntegrationMiddleware("query", ...getIntegrationKindsByCategory("mediaRequest")))
    .query(async ({ ctx }) => {
      const results = await Promise.all(
        ctx.integrations.map(async (integration) => {
          const innerHandler = mediaRequestStatsRequestHandler.handler(integration, {});
          const { data } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });
          return {
            integration: {
              id: integration.id,
              name: integration.name,
              kind: integration.kind,
            },
            data,
          };
        }),
      );
      return {
        stats: results.flatMap((result) => result.data.stats),
        users: results
          .map((result) => result.data.users.map((user) => ({ ...user, integration: result.integration })))
          .flat()
          .sort(({ requestCount: countA }, { requestCount: countB }) => countB - countA),
        integrations: results.map((result) => result.integration),
      };
    }),
  answerRequest: protectedProcedure
    .concat(createOneIntegrationMiddleware("interact", ...getIntegrationKindsByCategory("mediaRequest")))
    .input(z.object({ requestId: z.number(), answer: z.enum(["approve", "decline"]) }))
    .mutation(async ({ ctx: { integration }, input }) => {
      const integrationInstance = await createIntegrationAsync(integration);
      const innerHandler = mediaRequestListRequestHandler.handler(integration, {});

      if (input.answer === "approve") {
        await integrationInstance.approveRequestAsync(input.requestId);
        await innerHandler.invalidateAsync();
        return;
      }
      await integrationInstance.declineRequestAsync(input.requestId);
      await innerHandler.invalidateAsync();
    }),
});
