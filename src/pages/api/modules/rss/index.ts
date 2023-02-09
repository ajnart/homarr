import Consola from 'consola';

import { decode } from 'html-entities';

import { NextApiRequest, NextApiResponse } from 'next';

import Parser from 'rss-parser';

import { Stopwatch } from '../../../../tools/shared/stopwatch';

const test1 = 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml';
const test2 = 'http://rss.cnn.com/rss/edition.rss';
const test3 = 'https://partner-feeds.beta.20min.ch/rss/20minuten';
const test4 =
  'https://www.bmi.bund.de/DE/service/rss-newsfeed/function/rssnewsfeed-pressemitteilungen.xml;jsessionid=C1C89DBDAEB9C8DAD90A0AC24E78735A.2_cid364';

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
  Consola.info('Requesting RSS feed...');
  const stopWatch = new Stopwatch();
  const feed = await parser.parseURL(test1);
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

  response.status(200).json(orderedFeed);
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
