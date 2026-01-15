import { observable } from "@trpc/server/observable";
import { z } from "zod/v4";

import { sendPingRequestAsync } from "@homarr/ping";
import { pingChannel, pingUrlChannel } from "@homarr/redis";

import { createTRPCRouter, publicProcedure } from "../../trpc";

export const appRouter = createTRPCRouter({
  ping: publicProcedure.input(z.object({ url: z.string() })).query(async ({ input }) => {
    const pingResult = await sendPingRequestAsync(input.url);

    return {
      url: input.url,
      ...pingResult,
    };
  }),
  updatedPing: publicProcedure
    .input(
      z.object({
        url: z.string(),
      }),
    )
    .subscription(async ({ input }) => {
      await pingUrlChannel.addAsync(input.url);

      const pingResult = await sendPingRequestAsync(input.url);

      return observable<{ url: string; statusCode: number; durationMs: number } | { url: string; error: string }>(
        (emit) => {
          emit.next({ url: input.url, ...pingResult });
          const unsubscribe = pingChannel.subscribe((message) => {
            // Only emit if same url
            if (message.url !== input.url) return;
            emit.next(message);
          });

          return () => {
            unsubscribe();
            void pingUrlChannel.removeAsync(input.url);
          };
        },
      );
    }),
});
