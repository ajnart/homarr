import { observable } from "@trpc/server/observable";
import { z } from "zod/v4";

import type { MinecraftServerStatus } from "@homarr/request-handler/minecraft-server-status";
import { minecraftServerStatusRequestHandler } from "@homarr/request-handler/minecraft-server-status";

import { createTRPCRouter, publicProcedure } from "../../trpc";

const serverStatusInputSchema = z.object({
  domain: z.string().nonempty(),
  isBedrockServer: z.boolean(),
});
export const minecraftRouter = createTRPCRouter({
  getServerStatus: publicProcedure.input(serverStatusInputSchema).query(async ({ input }) => {
    const innerHandler = minecraftServerStatusRequestHandler.handler({
      isBedrockServer: input.isBedrockServer,
      domain: input.domain,
    });
    return await innerHandler.getCachedOrUpdatedDataAsync({ forceUpdate: true });
  }),
  subscribeServerStatus: publicProcedure.input(serverStatusInputSchema).subscription(({ input }) => {
    return observable<MinecraftServerStatus>((emit) => {
      const innerHandler = minecraftServerStatusRequestHandler.handler({
        isBedrockServer: input.isBedrockServer,
        domain: input.domain,
      });
      const unsubscribe = innerHandler.subscribe((data) => {
        emit.next(data);
      });

      return () => {
        unsubscribe();
      };
    });
  }),
});
