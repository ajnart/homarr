import Consola from 'consola';

import { getCookie } from 'cookies-next';

import { decode } from 'html-entities';

import { NextApiRequest, NextApiResponse } from 'next';

import Parser from 'rss-parser';

import { getConfig } from '../../../../tools/config/getConfig';
import { Stopwatch } from '../../../../tools/shared/stopwatch';
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

export const Get = async (request: NextApiRequest, response: NextApiResponse) => {
  const configName = getCookie('config-name', { req: request });
  const config = getConfig(configName?.toString() ?? 'default');

  const rssWidget = config.widgets.find((x) => x.id === 'rss') as IRssWidget | undefined;

  if (
    !rssWidget ||
    !rssWidget.properties.rssFeedUrl ||
    rssWidget.properties.rssFeedUrl.length < 1
  ) {
    response.status(400).json({ message: 'required widget does not exist' });
    return;
  }

  Consola.info('Requesting RSS feed...');
  const stopWatch = new Stopwatch();
  const feed = await parser.parseURL(rssWidget.properties.rssFeedUrl);
  Consola.info(`Retrieved RSS feed after ${stopWatch.getEllapsedMilliseconds()} milliseconds`);

  const orderedFeed = {
    ...feed,
    items: feed.items
      .map((item) => ({
        ...item,
        title: item.title ? decode(item.title) : undefined,
        content: decode(item.content),
        enclosure: createEnclosure(item),
      }))
      .sort((a, b) => {
        if (!a.pubDate || !b.pubDate) {
          return 0;
        }

        if (a.pubDate < b.pubDate) {
          return -1;
        }

        if (a.pubDate > b.pubDate) {
          return 1;
        }

        return 0;
      })
      .slice(0, 20),
  };

  response.status(200).json({
    feed: orderedFeed,
    success: orderedFeed?.items !== undefined,
  });
};

const createEnclosure = (item: any) => {
  if (item.enclosure) {
    return item.enclosure;
  }

  if (item['media:content']) {
    return {
      url: item['media:content']['$'].url,
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
