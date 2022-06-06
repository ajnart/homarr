import { Table, Text, Tooltip, Title, Group, Progress, Skeleton, ScrollArea } from '@mantine/core';
import { IconDownload as Download } from '@tabler/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { IModule } from '../modules';
import { useConfig } from '../../../tools/state';
import { AddItemShelfButton } from '../../AppShelf/AddAppShelfItem';
import { useSetSafeInterval } from '../../../tools/hooks/useSetSafeInterval';

export const DownloadsModule: IModule = {
  title: 'Torrent',
  description: 'Show the current download speed of supported services',
  icon: Download,
  component: DownloadComponent,
  options: {
    hidecomplete: {
      name: 'Hide completed torrents',
      value: false,
    },
  },
};

export default function DownloadComponent() {
  const { config } = useConfig();
  const downloadServices =
    config.services.filter(
      (service) =>
        service.type === 'qBittorrent' ||
        service.type === 'Transmission' ||
        service.type === 'Deluge'
    ) ?? [];
  const hideComplete: boolean =
    (config?.modules?.[DownloadsModule.title]?.options?.hidecomplete?.value as boolean) ?? false;
  const [torrents, setTorrents] = useState<NormalizedTorrent[]>([]);
  const setSafeInterval = useSetSafeInterval();
  useEffect(() => {
    setSafeInterval(() => {
      // Send one request with each download service inside
      axios.post('/api/modules/downloads', { config }).then((response) => {
        setTorrents(response.data);
      });
    }, 1000);
  }, [config.modules]);

  if (downloadServices.length === 0) {
    return (
      <Group direction="column">
        <Title order={3}>No supported download clients found!</Title>
        <Group>
          <Text>Add a download service to view your current downloads...</Text>
          <AddItemShelfButton />
        </Group>
      </Group>
    );
  }

  if (torrents.length === 0) {
    return (
      <>
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
        <Skeleton height={40} mt={10} />
      </>
    );
  }

  const ths = (
    <tr>
      <th>Name</th>
      <th>Download</th>
      <th>Upload</th>
      <th>Progress</th>
    </tr>
  );
  // Loop over qBittorrent torrents merging with deluge torrents
  const rows = torrents.map((torrent) => {
    if (torrent.progress === 1 && hideComplete) {
      return [];
    }
    const downloadSpeed = torrent.downloadSpeed / 1024 / 1024;
    const uploadSpeed = torrent.uploadSpeed / 1024 / 1024;
    return (
      <tr key={torrent.id}>
        <td>
          <Tooltip position="top" label={torrent.name}>
            <Text
              style={{
                maxWidth: '30vw',
              }}
              size="xs"
              lineClamp={1}
            >
              {torrent.name}
            </Text>
          </Tooltip>
        </td>
        <td>
          <Text size="xs">{downloadSpeed > 0 ? `${downloadSpeed.toFixed(1)} Mb/s` : '-'}</Text>
        </td>
        <td>
          <Text size="xs">{uploadSpeed > 0 ? `${uploadSpeed.toFixed(1)} Mb/s` : '-'}</Text>
        </td>
        <td>
          <Text>{(torrent.progress * 100).toFixed(1)}%</Text>
          <Progress
            radius="lg"
            color={torrent.progress === 1 ? 'green' : 'blue'}
            value={torrent.progress * 100}
            size="lg"
          />
        </td>
      </tr>
    );
  });
  return (
    <Group noWrap grow direction="column">
      <Title order={4}>Your torrents</Title>
      <ScrollArea sx={{ height: 300 }}>
        <Table highlightOnHover>
          <thead>{ths}</thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
    </Group>
  );
}
