import { observable } from "@trpc/server/observable";

import { getIntegrationKindsByCategory } from "@homarr/definitions";
import type { MediaTranscoding } from "@homarr/request-handler/media-transcoding";
import { mediaTranscodingRequestHandler } from "@homarr/request-handler/media-transcoding";
import { paginatedSchema } from "@homarr/validation/common";

import type { IntegrationAction } from "../../middlewares/integration";
import { createOneIntegrationMiddleware } from "../../middlewares/integration";
import { createTRPCRouter, publicProcedure } from "../../trpc";

const createIndexerManagerIntegrationMiddleware = (action: IntegrationAction) =>
  createOneIntegrationMiddleware(action, ...getIntegrationKindsByCategory("mediaTranscoding"));

export const mediaTranscodingRouter = createTRPCRouter({
  getDataAsync: publicProcedure
    .concat(createIndexerManagerIntegrationMiddleware("query"))
    .input(paginatedSchema.pick({ page: true, pageSize: true }))
    .query(async ({ ctx, input }) => {
      const innerHandler = mediaTranscodingRequestHandler.handler(ctx.integration, {
        pageOffset: (input.page - 1) * input.pageSize,
        pageSize: input.pageSize,
      });
      const { data } = await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: false });

      return {
        integrationId: ctx.integration.id,
        data,
      };
    }),
  subscribeData: publicProcedure
    .concat(createIndexerManagerIntegrationMiddleware("query"))
    .input(paginatedSchema.pick({ page: true, pageSize: true }))
    .subscription(({ ctx, input }) => {
      return observable<{ integrationId: string; data: MediaTranscoding }>((emit) => {
        const innerHandler = mediaTranscodingRequestHandler.handler(ctx.integration, {
          pageOffset: (input.page - 1) * input.pageSize,
          pageSize: input.pageSize,
        });
        const unsubscribe = innerHandler.subscribe((data) => {
          emit.next({ integrationId: input.integrationId, data });
        });
        return unsubscribe;
      });
    }),
});
