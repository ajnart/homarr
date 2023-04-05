import Link from 'next/link';
import {
  ActionIcon,
  Badge,
  Card,
  Center,
  Flex,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  MediaQuery,
  ScrollArea,
  Stack,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import { IconClock, IconRefresh, IconRss } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'rss',
  icon: IconRss,
  options: {
    rssFeedUrl: {
      type: 'multiple-text',
      defaultValue: ['https://github.com/ajnart/homarr/tags.atom'],
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: RssTile,
});

export type IRssWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface RssTileProps {
  widget: IRssWidget;
}

export const useGetRssFeeds = (feedUrls: string[], widgetId: string) =>
  useQuery({
    queryKey: ['rss-feeds', feedUrls],
    // Cache the results for 24 hours
    cacheTime: 1000 * 60 * 60 * 24,
    queryFn: async () => {
      const responses = await Promise.all(
        feedUrls.map((feedUrl) =>
          fetch(
            `/api/modules/rss?widgetId=${widgetId}&feedUrl=${encodeURIComponent(feedUrl)}`
          ).then((response) => response.json())
        )
      );
      return responses;
    },
  });

function RssTile({ widget }: RssTileProps) {
  const { t } = useTranslation('modules/rss');
  const { data, isLoading, isFetching, isError, refetch } = useGetRssFeeds(
    widget.properties.rssFeedUrl,
    widget.id
  );
  const { classes } = useStyles();

  function formatDate(input: string): string {
    // Parse the input date as a local date
    try {
      const inputDate = dayjs(new Date(input));
      const now = dayjs(); // Current date and time
      // The difference between the input date and now
      const difference = now.diff(inputDate, 'ms');
      const duration = dayjs.duration(difference, 'ms');
      const humanizedDuration = duration.humanize();
      return `${humanizedDuration} ago`;
    } catch (e) {
      return 'Error';
    }
  }

  if (!data || isLoading) {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    );
  }

  if (data.length < 1 || isError) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconRss size={40} strokeWidth={1} />
          <Title order={6}>{t('card.errors.general.title')}</Title>
          <Text align="center">{t('card.errors.general.text')}</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack h="100%">
      <LoadingOverlay visible={isFetching} />
      <ScrollArea className="scroll-area-w100" w="100%" mt="sm" mb="sm">
        {data.map((feed, index) => (
          <Stack w="100%" spacing="xs">
            {feed.feed.items.map((item: any, index: number) => (
              <Card
                key={index}
                withBorder
                component={Link ?? 'div'}
                href={item.link}
                radius="md"
                target="_blank"
                w="100%"
              >
                {item.enclosure && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={classes.backgroundImage}
                    src={item.enclosure.url ?? undefined}
                    alt="backdrop"
                  />
                )}

                <Flex gap="xs">
                  {item.enclosure && (
                    <MediaQuery query="(max-width: 1200px)" styles={{ display: 'none' }}>
                      <Image
                        src={item.enclosure?.url ?? undefined}
                        width={140}
                        height={140}
                        radius="md"
                        withPlaceholder
                      />
                    </MediaQuery>
                  )}
                  <Flex gap={2} direction="column" w="100%">
                    {item.categories && (
                      <Flex gap="xs" wrap="wrap" h={20} style={{ overflow: 'hidden' }}>
                        {item.categories.map((category: any, categoryIndex: number) => (
                          <Badge key={categoryIndex}>{category}</Badge>
                        ))}
                      </Flex>
                    )}

                    <Text lineClamp={2}>{item.title}</Text>
                    <Text color="dimmed" size="xs" lineClamp={3}>
                      {item.content}
                    </Text>

                    {item.pubDate && (
                      <InfoDisplay title={feed.feed.title} date={formatDate(item.pubDate)} />
                    )}
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Stack>
        ))}
      </ScrollArea>

      <ActionIcon
        size="sm"
        radius="xl"
        pos="absolute"
        right={10}
        onClick={() => refetch()}
        bottom={10}
        styles={{
          root: {
            borderColor: 'red',
          },
        }}
      >
        <IconRefresh />
      </ActionIcon>
    </Stack>
  );
}

const InfoDisplay = ({ date, title }: { date: string; title: string | undefined }) => (
  <Group mt="auto" spacing="xs">
    <IconClock size={14} />
    <Text size="xs" color="dimmed">
      {date}
    </Text>
    {title && (
      <Badge variant="outline" size="xs">
        {title}
      </Badge>
    )}
  </Group>
);

const useStyles = createStyles(({ colorScheme }) => ({
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    filter: colorScheme === 'dark' ? 'blur(30px)' : 'blur(15px)',
    transform: 'scaleX(-1)',
    opacity: colorScheme === 'dark' ? 0.3 : 0.2,
    transition: 'ease-in-out 0.2s',

    '&:hover': {
      opacity: colorScheme === 'dark' ? 0.4 : 0.3,
      filter: 'blur(40px) brightness(0.7)',
    },
  },
}));

export default definition;
