import { z } from 'zod';
import RssParser from 'rss-parser';
import Consola from 'consola';
import { decode } from 'html-entities';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { Stopwatch } from '~/tools/shared/time/stopwatch.tool';

type CustomItem = {
  'media:content': string;
  enclosure: {
    url: string;
  };
};

const rssFeedResultObjectSchema = z
  .object({
    success: z.literal(false),
    feed: z.undefined(),
  })
  .or(
    z.object({
      success: z.literal(true),
      feed: z.object({
        title: z.string().or(z.undefined()),
        items: z.array(
          z.object({
            link: z.string(),
            enclosure: z
              .object({
                url: z.string(),
              })
              .or(z.undefined()),
            categories: z.array(z.string()).or(z.undefined()),
            title: z.string(),
            content: z.string(),
            pubDate: z.string(),
          })
        ),
      }),
    })
  );

const parser: RssParser<any, CustomItem> = new RssParser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

export const rssRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        urls: z.array(z.string().url()),
      })
    )
    .output(z.array(rssFeedResultObjectSchema))
    .query(async ({ input }) => {
      const promises = input.urls.map(async (url) => {
        Consola.info(`Requesting RSS feed at url ${url}`);
        const stopWatch = new Stopwatch();
        const feed = await parser.parseURL(url);
        Consola.info(
          `Retrieved RSS feed after ${stopWatch.getEllapsedMilliseconds()} milliseconds`
        );

        const orderedFeed = {
          ...feed,
          items: feed.items
            .map((item: { title: any; content: any }) => ({
              ...item,
              title: item.title ? decode(item.title) : undefined,
              content: decode(item.content),
              enclosure: createEnclosure(item),
              link: createLink(item),
            }))
            .sort((a: { pubDate: number }, b: { pubDate: number }) => {
              if (!a.pubDate || !b.pubDate) {
                return 0;
              }

              return a.pubDate - b.pubDate;
            })
            .slice(0, 20),
        };
        return orderedFeed;
      });

      const results = (await Promise.allSettled(promises)).map((result) => ({
        success: result.status === 'fulfilled',
        feed: result.status === 'fulfilled' ? result.value : undefined,
      }));

      return results;
    }),
});

const createLink = (item: any) => {
  if (item.link) {
    return item.link;
  }

  return item.guid;
};

const createEnclosure = (item: any) => {
  if (item.enclosure) {
    return item.enclosure;
  }

  if (item['media:content']) {
    return {
      url: item['media:content'].$.url,
    };
  }

  return undefined;
};
