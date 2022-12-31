import {
  Center,
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
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useConfigContext } from '../../config/provider';
import { useGetTorrentData } from '../../hooks/widgets/torrents/useGetTorrentData';
import { AppIntegrationType } from '../../types/app';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { BitTorrrentQueueItem } from './BitTorrentQueueItem';

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
    minWidth: 4,
    minHeight: 5,
    maxWidth: 12,
    maxHeight: 14,
  },
  component: BitTorrentTile,
});

export type IBitTorrent = IWidget<typeof definition['id'], typeof definition>;

interface BitTorrentTileProps {
  widget: IBitTorrent;
}

function BitTorrentTile({ widget }: BitTorrentTileProps) {
  const { t } = useTranslation('modules/torrents');
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;
  const { width } = useElementSize();

  const { config } = useConfigContext();
  const downloadApps =
    config?.apps.filter((x) => x.integration && downloadAppTypes.includes(x.integration.type)) ??
    [];

  const [selectedAppId, setSelectedApp] = useState<string | null>(downloadApps[0]?.id);
  const { data, isFetching, isError } = useGetTorrentData({ appId: selectedAppId! });

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

  if (isFetching) {
    return (
      <Stack align="center">
        <Loader />
        <Stack align="center" spacing={0}>
          <Text>{t('card.loading.title')}</Text>
          <Text color="dimmed">Homarr is establishing a connection...</Text>
        </Stack>
      </Stack>
    );
  }

  if (!data || data.length < 1) {
    return (
      <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title order={3}>{t('card.table.body.nothingFound')}</Title>
      </Center>
    );
  }

  return (
    <ScrollArea sx={{ height: 300, width: '100%' }}>
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
          {data.map((item, index) => (
            <BitTorrrentQueueItem key={index} torrent={item} />
          ))}
        </tbody>
      </Table>
    </ScrollArea>
  );
}

export default definition;
