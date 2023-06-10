import xss from 'xss';
import { NextApiRequest, NextApiResponse } from 'next';
import Consola from 'consola';
import { getCookie } from 'cookies-next';
import { decode, encode } from 'html-entities';
import Parser from 'rss-parser';
import { z } from 'zod';

import { getConfig } from '../../../../tools/config/getConfig';
import { Stopwatch } from '../../../../tools/shared/time/stopwatch.tool';
import { IRssWidget } from '../../../../widgets/rss/RssWidgetTile';

type CustomItem = {
  'media:content': string;
  enclosure: {
    url: string;
  };
};

const parser: Parser<any, CustomItem> = new Parser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

const getQuerySchema = z.object({
  widgetId: z.string().uuid(),
  feedUrl: z.string(),
});

export const Get = async (request: NextApiRequest, response: NextApiResponse) => {
  const configName = getCookie('config-name', { req: request });
  const config = getConfig(configName?.toString() ?? 'default');

  const parseResult = getQuerySchema.safeParse(request.query);

  if (!parseResult.success) {
    response.status(400).json({ message: 'invalid query parameters, please specify the widgetId' });
    return;
  }

  const rssWidget = config.widgets.find(
    (x) => x.type === 'rss' && x.id === parseResult.data.widgetId
  ) as IRssWidget | undefined;
  if (
    !rssWidget ||
    !rssWidget.properties.rssFeedUrl ||
    rssWidget.properties.rssFeedUrl.length < 1
  ) {
    response.status(400).json({ message: 'required widget does not exist' });
    return;
  }

  Consola.info(`Requesting RSS feed at url ${parseResult.data.feedUrl}`);
  const stopWatch = new Stopwatch();
  const feed = await parser.parseURL(parseResult.data.feedUrl);
  Consola.info(`Retrieved RSS feed after ${stopWatch.getEllapsedMilliseconds()} milliseconds`);

  const orderedFeed = {
    ...feed,
    items: feed.items
      .map((item: { title: string; content: string; 'content:encoded': string }) => ({
        ...item,
        title: item.title ? decode(item.title) : undefined,
        content: processItemContent(
          item['content:encoded'] ?? item.content,
          rssWidget.properties.dangerousAllowSanitizedItemContent
        ),
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

  response.status(200).json({
    feed: orderedFeed,
    success: orderedFeed?.items !== undefined,
  });
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
        img: ['src', 'width', 'height'],
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

  return encode(content);
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

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'GET') {
    return Get(request, response);
  }

  return response.status(405);
};
