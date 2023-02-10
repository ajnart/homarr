import {
  ActionIcon,
  Badge,
  Card,
  Center,
  createStyles,
  Flex,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  MediaQuery,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import {
  IconBulldozer,
  IconCalendarTime,
  IconClock,
  IconCopyright,
  IconRefresh,
  IconRss,
  IconSpeakerphone,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState } from 'react';
import { useGetRssFeed } from '../../hooks/widgets/rss/useGetRssFeed';
import { sleep } from '../../tools/client/time';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'rss',
  icon: IconRss,
  options: {
    rssFeedUrl: {
      type: 'text',
      defaultValue: '',
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

function RssTile({ widget }: RssTileProps) {
  const { t } = useTranslation('modules/rss');
  const { data, isLoading, isFetching, refetch } = useGetRssFeed();
  const { classes } = useStyles();
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false);

  if (!data || isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (!data.success) {
    return (
      <Center>
        <Stack align="center">
          <IconRss size={40} strokeWidth={1} />
          <Title order={6}>{t('card.errors.general.title')}</Title>
          <Text align="center">{t('card.errors.general.text')}</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack>
      <LoadingOverlay visible={loadingOverlayVisible} />
      <Flex gap="md">
        {data.feed.image ? (
          <Image
            src={data.feed.image.url}
            alt={data.feed.image.title}
            width="auto"
            height={40}
            maw="50%"
            mx="auto"
          />
        ) : (
          <Title order={6}>{data.feed.title}</Title>
        )}
        <UnstyledButton
          onClick={async () => {
            setLoadingOverlayVisible(true);
            await sleep(1500);
            await refetch();
            setLoadingOverlayVisible(false);
          }}
          disabled={isFetching || isLoading}
        >
          <ActionIcon>
            <IconRefresh />
          </ActionIcon>
        </UnstyledButton>
      </Flex>
      {data.feed.items.map((item: any, index: number) => (
        <Card key={index} withBorder component={Link} href={item.link} radius="md" target="_blank">
          {item.enclosure && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={classes.backgroundImage}
              src={item.enclosure.url ?? undefined}
              alt="backdrop"
            />
          )}

          <Flex gap="xs">
            <MediaQuery query="(max-width: 1200px)" styles={{ display: 'none' }}>
              <Image
                src={item.enclosure?.url ?? undefined}
                width={140}
                height={140}
                radius="md"
                withPlaceholder
              />
            </MediaQuery>

            <Flex gap={2} direction="column">
              {item.categories && (
                <Flex gap="xs" wrap="wrap" style={{ height: 20, overflow: 'hidden' }}>
                  {item.categories.map((category, categoryIndex: number) => (
                    <Badge key={categoryIndex}>{category._}</Badge>
                  ))}
                </Flex>
              )}

              <Text lineClamp={2}>{item.title}</Text>
              <Text color="dimmed" size="xs" lineClamp={3}>
                {item.content}
              </Text>

              {item.pubDate && <TimeDisplay date={item.pubDate} />}
            </Flex>
          </Flex>
        </Card>
      ))}
      <Flex wrap="wrap" columnGap="md">
        <Group spacing="sm">
          <IconCopyright size={14} />
          <Text color="dimmed" size="sm">
            {data.feed.copyright}
          </Text>
        </Group>
        <Group>
          <IconCalendarTime size={14} />
          <Text color="dimmed" size="sm">
            {data.feed.pubDate}
          </Text>
        </Group>
        <Group>
          <IconBulldozer size={14} />
          <Text color="dimmed" size="sm">
            {data.feed.lastBuildDate}
          </Text>
        </Group>
        {data.feed.feedUrl && (
          <Group spacing="sm">
            <IconSpeakerphone size={14} />
            <Text
              color="dimmed"
              size="sm"
              variant="link"
              target="_blank"
              component={Link}
              href={data.feed.feedUrl}
            >
              {data.feed.feedUrl}
            </Text>
          </Group>
        )}
      </Flex>
    </Stack>
  );
}

const TimeDisplay = ({ date }: { date: string }) => (
  <Group mt="auto" spacing="xs">
    <IconClock size={14} />
    <Text size="xs" color="dimmed">
      {date}
    </Text>
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
