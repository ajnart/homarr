import {
  Badge,
  Center,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconFileDownload } from '@tabler/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'next-i18next';
import { useGetDownloadClientsQueue } from '../../hooks/widgets/download-speed/useGetNetworkSpeed';
import { NormalizedDownloadQueueResponse } from '../../types/api/downloads/queue/NormalizedDownloadQueueResponse';
import { AppIntegrationType } from '../../types/app';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { BitTorrrentQueueItem } from './TorrentQueueItem';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const downloadAppTypes: AppIntegrationType['type'][] = ['deluge', 'qBittorrent', 'transmission'];

const definition = defineWidget({
  id: 'torrents-status',
  icon: IconFileDownload,
  options: {
    displayCompletedTorrents: {
      type: 'switch',
      defaultValue: true,
    },
    displayStaleTorrents: {
      type: 'switch',
      defaultValue: true,
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 14,
  },
  component: TorrentTile,
});

export type ITorrent = IWidget<(typeof definition)['id'], typeof definition>;

interface TorrentTileProps {
  widget: ITorrent;
}

function TorrentTile({ widget }: TorrentTileProps) {
  const { t } = useTranslation('modules/torrents-status');
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;
  const { width } = useElementSize();

  const {
    data,
    isError,
    isInitialLoading,
    dataUpdatedAt,
  }: {
    data: NormalizedDownloadQueueResponse | undefined;
    isError: boolean;
    isInitialLoading: boolean;
    dataUpdatedAt: number;
  } = useGetDownloadClientsQueue();

  if (isError) {
    return (
      <Stack>
        <Title order={3}>{t('card.errors.generic.title')}</Title>
        <Group>
          <Text>{t('card.errors.generic.text')}</Text>
        </Group>
      </Stack>
    );
  }

  if (isInitialLoading || !data) {
    return (
      <Stack
        align="center"
        justify="center"
        style={{
          height: '100%',
        }}
      >
        <Loader />
        <Stack align="center" spacing={0}>
          <Text>{t('card.loading.title')}</Text>
          <Text color="dimmed">Homarr is establishing a connection...</Text>
        </Stack>
      </Stack>
    );
  }

  if (data.apps.length === 0) {
    return (
      <Stack>
        <Title order={3}>{t('card.errors.noDownloadClients.title')}</Title>
        <Group>
          <Text>{t('card.errors.noDownloadClients.text')}</Text>
        </Group>
      </Stack>
    );
  }

  if (!data || Object.values(data.apps).length < 1) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title order={3}>{t('card.table.body.nothingFound')}</Title>
      </Center>
    );
  }

  const torrents = data.apps
    .flatMap((app) => (app.type === 'torrent' ? app.torrents : []))
    .filter((torrent) => (widget.properties.displayCompletedTorrents ? true : !torrent.isCompleted))
    .filter((torrent) =>
      widget.properties.displayStaleTorrents
        ? true
        : torrent.isCompleted || torrent.downloadSpeed > 0
    );

  const difference = new Date().getTime() - dataUpdatedAt;
  const duration = dayjs.duration(difference, 'ms');
  const humanizedDuration = duration.humanize();

  return (
    <Flex direction="column" sx={{ height: '100%' }}>
      <ScrollArea sx={{ height: '100%', width: '100%' }} mb="xs">
        <Table highlightOnHover p="sm">
          <thead>
            <tr>
              <th>{t('card.table.header.name')}</th>
              <th>{t('card.table.header.size')}</th>
              {width > MIN_WIDTH_MOBILE && <th>{t('card.table.header.download')}</th>}
              {width > MIN_WIDTH_MOBILE && <th>{t('card.table.header.upload')}</th>}
              {width > MIN_WIDTH_MOBILE && <th>{t('card.table.header.estimatedTimeOfArrival')}</th>}
              <th>{t('card.table.header.progress')}</th>
            </tr>
          </thead>
          <tbody>
            {torrents.map((torrent, index) => (
              <BitTorrrentQueueItem key={index} torrent={torrent} app={undefined} />
            ))}
          </tbody>
        </Table>
      </ScrollArea>
      <Group spacing="sm">
        {data.apps.some((x) => !x.success) && (
          <Badge variant="dot" color="red">
            {t('card.footer.error')}
          </Badge>
        )}

        <Text color="dimmed" size="xs">
          {t('card.footer.lastUpdated', { time: humanizedDuration })}
        </Text>
      </Group>
    </Flex>
  );
}

export default definition;
