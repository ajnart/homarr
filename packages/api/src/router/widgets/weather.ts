import { observable } from "@trpc/server/observable";
import { z } from "zod/v4";

import type { Weather } from "@homarr/request-handler/weather";
import { weatherRequestHandler } from "@homarr/request-handler/weather";

import { createTRPCRouter, publicProcedure } from "../../trpc";

const atLocationInput = z.object({
  longitude: z.number(),
  latitude: z.number(),
});

export const weatherRouter = createTRPCRouter({
  atLocation: publicProcedure.input(atLocationInput).query(async ({ input }) => {
    const handler = weatherRequestHandler.handler(input);
    return await handler.getCachedOrUpdatedDataAsync({ forceUpdate: false }).then((result) => result.data);
  }),
  subscribeAtLocation: publicProcedure.input(atLocationInput).subscription(({ input }) => {
    return observable<Weather>((emit) => {
      const handler = weatherRequestHandler.handler(input);
      const unsubscribe = handler.subscribe((data) => {
        emit.next(data);
      });

      return unsubscribe;
    });
  }),
});
