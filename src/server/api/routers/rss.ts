import { TRPCError } from '@trpc/server';
import Consola from 'consola';
import { decode, encode } from 'html-entities';
import RssParser from 'rss-parser';
import xss from 'xss';
import { z } from 'zod';
import { getConfig } from '~/tools/config/getConfig';
import { Stopwatch } from '~/tools/shared/time/stopwatch.tool';
import { IRssWidget } from '~/widgets/rss/RssWidgetTile';

import { createTRPCRouter, publicProcedure } from '../trpc';

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
            pubDate: z.string().optional(),
          }),
        ),
      }),
    }),
  );

export const rssRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        widgetId: z.string().uuid(),
        feedUrls: z.array(z.string()),
        configName: z.string(),
      }),
    )
    .output(z.array(rssFeedResultObjectSchema))
    .query(async ({ input }) => {
      const config = getConfig(input.configName);

      const rssWidget = config.widgets.find((x) => x.type === 'rss' && x.id === input.widgetId) as
        | IRssWidget
        | undefined;

      if (!rssWidget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'required widget does not exist',
        });
      }

      if (input.feedUrls.length === 0) {
        return [];
      }

      const result = await Promise.all(
        input.feedUrls.map(async (feedUrl) =>
          getFeedUrl(feedUrl, rssWidget.properties.dangerousAllowSanitizedItemContent),
        ),
      );

      return result;
    }),
});

const getFeedUrl = async (feedUrl: string, dangerousAllowSanitizedItemContent: boolean) => {
  Consola.info(`Requesting RSS feed at url ${feedUrl}`);
  const stopWatch = new Stopwatch();
  const feed = await parser.parseURL(feedUrl);
  Consola.info(`Retrieved RSS feed after ${stopWatch.getEllapsedMilliseconds()} milliseconds`);

  const orderedFeed = {
    ...feed,
    items: feed.items
      .map(
        (item: {
          title: string;
          content: string;
          'content:encoded': string;
          categories: string[] | { _: string }[];
        }) => ({
          ...item,
          categories: item.categories
            ?.map((category) => (typeof category === 'string' ? category : category._))
            .filter((category: unknown): category is string => typeof category === 'string'),
          title: item.title ? decode(item.title) : undefined,
          content: processItemContent(
            item['content:encoded'] ?? item.content,
            dangerousAllowSanitizedItemContent,
          ),
          enclosure: createEnclosure(item),
          link: createLink(item),
        }),
      )
      .sort((a: { pubDate: number }, b: { pubDate: number }) => {
        if (!a.pubDate || !b.pubDate) {
          return 0;
        }

        return a.pubDate - b.pubDate;
      })
      .slice(0, 20),
  };

  return {
    feed: orderedFeed,
    success: orderedFeed?.items !== undefined,
  };
};

const processItemContent = (content: string, dangerousAllowSanitizedItemContent: boolean) => {
  if (dangerousAllowSanitizedItemContent) {
    return xss(content, {
      allowList: {
        p: [],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
        a: ['href'],
        b: [],
        strong: [],
        i: [],
        em: [],
        img: ['src', 'width', 'height', 'alt'],
        br: [],
        small: [],
        ul: [],
        li: [],
        ol: [],
        figure: [],
        svg: [],
        code: [],
        mark: [],
        blockquote: [],
      },
    });
  }

  return encode(content, {
    level: "html5"
  });
};

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

const parser: RssParser<any, CustomItem> = new RssParser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});
