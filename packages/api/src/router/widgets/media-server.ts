import { observable } from "@trpc/server/observable";
import { z } from "zod/v4";

import { getIntegrationKindsByCategory } from "@homarr/definitions";
import type { StreamSession } from "@homarr/integrations";
import { mediaServerRequestHandler } from "@homarr/request-handler/media-server";

import type { IntegrationAction } from "../../middlewares/integration";
import { createManyIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, publicProcedure } from "../../trpc";

const createMediaServerIntegrationMiddleware = (action: IntegrationAction) =>
  createManyIntegrationMiddleware(action, ...getIntegrationKindsByCategory("mediaService"));

export const mediaServerRouter = createTRPCRouter({
  getCurrentStreams: publicProcedure
    .concat(createMediaServerIntegrationMiddleware("query"))
    .input(z.object({ showOnlyPlaying: z.boolean() }))
    .query(async ({ ctx, input }) => {
      return await Promise.all(
        ctx.integrations.map(async (integration) => {
          const innerHandler = mediaServerRequestHandler.handler(integration, {
            showOnlyPlaying: input.showOnlyPlaying,
          });
          const { data } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });
          return {
            integrationId: integration.id,
            integrationKind: integration.kind,
            sessions: data,
          };
        }),
      );
    }),
  subscribeToCurrentStreams: publicProcedure
    .concat(createMediaServerIntegrationMiddleware("query"))
    .input(z.object({ showOnlyPlaying: z.boolean() }))
    .subscription(({ ctx, input }) => {
      return observable<{ integrationId: string; data: StreamSession[] }>((emit) => {
        const unsubscribes: (() => void)[] = [];
        for (const integration of ctx.integrations) {
          const innerHandler = mediaServerRequestHandler.handler(integration, {
            showOnlyPlaying: input.showOnlyPlaying,
          });

          const unsubscribe = innerHandler.subscribe((sessions) => {
            emit.next({
              integrationId: integration.id,
              data: sessions,
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
});
