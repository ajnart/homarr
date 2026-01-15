import { z } from "zod/v4";

import { rssFeedsRequestHandler } from "@homarr/request-handler/rss-feeds";

import { createTRPCRouter, publicProcedure } from "../../trpc";

export const rssFeedRouter = createTRPCRouter({
  getFeeds: publicProcedure
    .input(
      z.object({
        urls: z.array(z.string()),
        maximumAmountPosts: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const rssFeeds = await Promise.all(
        input.urls.map(async (url) => {
          const innerHandler = rssFeedsRequestHandler.handler({
            url,
            count: input.maximumAmountPosts,
          });
          return await innerHandler.getCachedOrUpdatedDataAsync({
            forceUpdate: false,
          });
        }),
      );

      return rssFeeds
        .flatMap((rssFeed) => rssFeed.data.entries)
        .slice(0, input.maximumAmountPosts)
        .sort((entryA, entryB) => {
          return entryA.published && entryB.published
            ? new Date(entryB.published).getTime() - new Date(entryA.published).getTime()
            : 0;
        });
    }),
});
