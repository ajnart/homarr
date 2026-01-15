import { observable } from "@trpc/server/observable";

import type { SystemHealthMonitoring } from "@homarr/integrations";
import type { ProxmoxClusterInfo } from "@homarr/integrations/types";
import { clusterInfoRequestHandler, systemInfoRequestHandler } from "@homarr/request-handler/health-monitoring";

import { createManyIntegrationMiddleware, createOneIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const healthMonitoringRouter = createTRPCRouter({
  getSystemHealthStatus: publicProcedure
    .concat(createManyIntegrationMiddleware("query", "openmediavault", "dashDot", "truenas", "unraid", "mock"))
    .query(async ({ ctx }) => {
      return await Promise.all(
        ctx.integrations.map(async (integration) => {
          const innerHandler = systemInfoRequestHandler.handler(integration, {});
          const { data, timestamp } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });

          return {
            integrationId: integration.id,
            integrationName: integration.name,
            healthInfo: data,
            updatedAt: timestamp,
          };
        }),
      );
    }),
  subscribeSystemHealthStatus: publicProcedure
    .concat(createManyIntegrationMiddleware("query", "openmediavault", "dashDot", "truenas", "unraid", "mock"))
    .subscription(({ ctx }) => {
      return observable<{ integrationId: string; healthInfo: SystemHealthMonitoring; timestamp: Date }>((emit) => {
        const unsubscribes: (() => void)[] = [];
        for (const integration of ctx.integrations) {
          const innerHandler = systemInfoRequestHandler.handler(integration, {});
          const unsubscribe = innerHandler.subscribe((healthInfo) => {
            emit.next({
              integrationId: integration.id,
              healthInfo,
              timestamp: new Date(),
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
  getClusterHealthStatus: publicProcedure
    .concat(createOneIntegrationMiddleware("query", "proxmox", "mock"))
    .query(async ({ ctx }) => {
      const innerHandler = clusterInfoRequestHandler.handler(ctx.integration, {});
      const { data } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });
      return data;
    }),
  subscribeClusterHealthStatus: publicProcedure
    .concat(createOneIntegrationMiddleware("query", "proxmox", "mock"))
    .subscription(({ ctx }) => {
      return observable<ProxmoxClusterInfo>((emit) => {
        const unsubscribes: (() => void)[] = [];
        const innerHandler = clusterInfoRequestHandler.handler(ctx.integration, {});
        const unsubscribe = innerHandler.subscribe((healthInfo) => {
          emit.next(healthInfo);
        });
        unsubscribes.push(unsubscribe);
        return () => {
          unsubscribe();
        };
      });
    }),
});
