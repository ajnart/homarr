import { observable } from "@trpc/server/observable";
import { z } from "zod/v4";

import type { Modify } from "@homarr/common/types";
import type { Integration } from "@homarr/db/schema";
import type { IntegrationKindByCategory } from "@homarr/definitions";
import { getIntegrationKindsByCategory } from "@homarr/definitions";
import { createIntegrationAsync } from "@homarr/integrations";
import type { DnsHoleSummary } from "@homarr/integrations/types";
import { dnsHoleRequestHandler } from "@homarr/request-handler/dns-hole";

import { createManyIntegrationMiddleware, createOneIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";

export const dnsHoleRouter = createTRPCRouter({
  summary: publicProcedure
    .concat(createManyIntegrationMiddleware("query", ...getIntegrationKindsByCategory("dnsHole")))
    .query(async ({ ctx }) => {
      const results = await Promise.all(
        ctx.integrations.map(async (integration) => {
          const innerHandler = dnsHoleRequestHandler.handler(integration, {});
          const { data, timestamp } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });

          return {
            integration: {
              id: integration.id,
              name: integration.name,
              kind: integration.kind,
              updatedAt: timestamp,
            },
            summary: data,
          };
        }),
      );
      return results;
    }),

  subscribeToSummary: publicProcedure
    .concat(createManyIntegrationMiddleware("query", ...getIntegrationKindsByCategory("dnsHole")))
    .subscription(({ ctx }) => {
      return observable<{
        integration: Modify<Integration, { kind: IntegrationKindByCategory<"dnsHole"> }>;
        summary: DnsHoleSummary;
      }>((emit) => {
        const unsubscribes: (() => void)[] = [];
        for (const integrationWithSecrets of ctx.integrations) {
          const { decryptedSecrets: _, ...integration } = integrationWithSecrets;
          const innerHandler = dnsHoleRequestHandler.handler(integrationWithSecrets, {});
          const unsubscribe = innerHandler.subscribe((summary) => {
            emit.next({
              integration,
              summary,
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

  enable: protectedProcedure
    .concat(createOneIntegrationMiddleware("interact", ...getIntegrationKindsByCategory("dnsHole")))
    .mutation(async ({ ctx: { integration } }) => {
      const client = await createIntegrationAsync(integration);
      await client.enableAsync();

      const innerHandler = dnsHoleRequestHandler.handler(integration, {});
      // We need to wait for the integration to be enabled before invalidating the cache
      await new Promise<void>((resolve) => {
        setTimeout(() => void innerHandler.invalidateAsync().then(resolve), 1000);
      });
    }),

  disable: protectedProcedure
    .input(
      z.object({
        duration: z.number().optional(),
      }),
    )
    .concat(createOneIntegrationMiddleware("interact", ...getIntegrationKindsByCategory("dnsHole")))
    .mutation(async ({ ctx: { integration }, input }) => {
      const client = await createIntegrationAsync(integration);
      await client.disableAsync(input.duration);

      const innerHandler = dnsHoleRequestHandler.handler(integration, {});
      // We need to wait for the integration to be disabled before invalidating the cache
      await new Promise<void>((resolve) => {
        setTimeout(() => void innerHandler.invalidateAsync().then(resolve), 1000);
      });
    }),
});
