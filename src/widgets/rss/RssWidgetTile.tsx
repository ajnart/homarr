import {
  ActionIcon,
  BackgroundImage,
  Badge,
  Button,
  Card,
  Center,
  createStyles,
  Flex,
  Group,
  Image,
  Indicator,
  Loader,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import NextLink from 'next/link';
import { IconClock, IconRefresh, IconRss } from '@tabler/icons';
import { useGetRssFeed } from '../../hooks/widgets/rss/useGetRssFeed';
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
  const { data, isLoading, isFetching, refetch } = useGetRssFeed();
  const { classes } = useStyles();
  if (!data || isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  console.log(data);

  return (
    <Stack>
      <Flex gap="md">
        {data.image && (
          <Indicator label={data.items.length} size={22}>
            <Image src={data.image.url} alt={data.image.title} width={50} height={50} />
          </Indicator>
        )}

        <Stack spacing={0}>
          <Title order={6} lineClamp={1}>
            {data.title}
          </Title>
          <Text>{data.description}</Text>
        </Stack>

        {isFetching && 'fetching'}
        {isLoading && 'loading'}

        <Group ml="auto">
          <UnstyledButton onClick={() => refetch()} disabled={isFetching || isLoading}>
            <ActionIcon>
              <IconRefresh />
            </ActionIcon>
          </UnstyledButton>
        </Group>
      </Flex>
      {data.items.map((item: any, index: number) => (
        <Card
          key={index}
          withBorder
          component={NextLink}
          href={item.link}
          radius="md"
          target="_blank"
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
            <Image
              src={item.enclosure?.url ?? undefined}
              width={140}
              height={140}
              radius="md"
              withPlaceholder
            />
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

const useStyles = createStyles(() => ({
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    filter: 'blur(30px)',
    transform: 'scaleX(-1)',
    opacity: 0.2,
  },
}));

export default definition;
