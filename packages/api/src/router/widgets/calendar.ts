import { observable } from "@trpc/server/observable";
import { z } from "zod/v4";

import type { Modify } from "@homarr/common/types";
import type { Integration } from "@homarr/db/schema";
import type { IntegrationKindByCategory } from "@homarr/definitions";
import { getIntegrationKindsByCategory } from "@homarr/definitions";
import type { CalendarEvent } from "@homarr/integrations/types";
import { radarrReleaseTypes } from "@homarr/integrations/types";
import { calendarMonthRequestHandler } from "@homarr/request-handler/calendar";

import { createManyIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const calendarRouter = createTRPCRouter({
  findAllEvents: publicProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(),
        releaseType: z.array(z.enum(radarrReleaseTypes)),
        showUnmonitored: z.boolean(),
      }),
    )
    .concat(createManyIntegrationMiddleware("query", ...getIntegrationKindsByCategory("calendar")))
    .query(async ({ ctx, input }) => {
      return await Promise.all(
        ctx.integrations.map(async (integration) => {
          const { integrationIds: _integrationIds, ...handlerInput } = input;
          const innerHandler = calendarMonthRequestHandler.handler(integration, handlerInput);
          const { data } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });

          return {
            events: data,
            integration: {
              id: integration.id,
              name: integration.name,
              kind: integration.kind,
            },
          };
        }),
      );
    }),
  subscribeToEvents: publicProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(),
        releaseType: z.array(z.enum(radarrReleaseTypes)),
        showUnmonitored: z.boolean(),
      }),
    )
    .concat(createManyIntegrationMiddleware("query", ...getIntegrationKindsByCategory("calendar")))
    .subscription(({ ctx, input }) => {
      return observable<{
        integration: Modify<Integration, { kind: IntegrationKindByCategory<"calendar"> }>;
        events: CalendarEvent[];
      }>((emit) => {
        const unsubscribes: (() => void)[] = [];
        for (const integrationWithSecrets of ctx.integrations) {
          const { decryptedSecrets: _, ...integration } = integrationWithSecrets;
          const { integrationIds: _integrationIds, ...handlerInput } = input;
          const innerHandler = calendarMonthRequestHandler.handler(integrationWithSecrets, handlerInput);
          const unsubscribe = innerHandler.subscribe((events) => {
            emit.next({
              integration,
              events,
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
