import { NormalizedTorrent } from '@ctrl/shared-torrent';
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
import { useEffect, useState } from 'react';
import { useConfigContext } from '../../config/provider';
import { useGetTorrentData } from '../../hooks/widgets/torrents/useGetTorrentData';
import { NormalizedTorrentListResponse } from '../../types/api/NormalizedTorrentListResponse';
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
    refreshInterval: {
      type: 'slider',
      defaultValue: 10,
      min: 1,
      max: 60,
      step: 1,
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

export type ITorrent = IWidget<typeof definition['id'], typeof definition>;

interface TorrentTileProps {
  widget: ITorrent;
}

function TorrentTile({ widget }: TorrentTileProps) {
  const { t } = useTranslation('modules/torrents-status');
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;
  const { width } = useElementSize();

  const { config } = useConfigContext();
  const downloadApps =
    config?.apps.filter((x) => x.integration && downloadAppTypes.includes(x.integration.type)) ??
    [];

  const [selectedAppId, setSelectedApp] = useState<string | null>(downloadApps[0]?.id);
  const {
    data,
    isError,
    isInitialLoading,
    dataUpdatedAt,
  }: {
    data: NormalizedTorrentListResponse | undefined;
    isError: boolean;
    isInitialLoading: boolean;
    dataUpdatedAt: number;
  } = useGetTorrentData({
    appId: selectedAppId!,
    refreshInterval: widget.properties.refreshInterval * 1000,
  });

  useEffect(() => {
    if (!selectedAppId && downloadApps.length) {
      setSelectedApp(downloadApps[0].id);
    }
  }, [downloadApps, selectedAppId]);

  if (downloadApps.length === 0) {
    return (
      <Stack>
        <Title order={3}>{t('card.errors.noDownloadClients.title')}</Title>
        <Group>
          <Text>{t('card.errors.noDownloadClients.text')}</Text>
        </Group>
      </Stack>
    );
  }

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

  if (isInitialLoading) {
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

  if (!data || Object.values(data.torrents).length < 1) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title order={3}>{t('card.table.body.nothingFound')}</Title>
      </Center>
    );
  }

  const filter = (torrent: NormalizedTorrent) => {
    if (!widget.properties.displayCompletedTorrents && torrent.isCompleted) {
      return false;
    }

    if (!widget.properties.displayStaleTorrents && !torrent.isCompleted && torrent.eta <= 0) {
      return false;
    }

    return true;
  };

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
            {data.torrents.map((concatenatedTorrentList) => {
              const app = config?.apps.find((x) => x.id === concatenatedTorrentList.appId);
              return concatenatedTorrentList.torrents
                .filter(filter)
                .map((item: NormalizedTorrent, index: number) => (
                  <BitTorrrentQueueItem key={index} torrent={item} app={app} />
                ));
            })}
          </tbody>
        </Table>
      </ScrollArea>
      <Group spacing="sm">
        {!data.allSuccess && (
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
