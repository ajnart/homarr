import { Loader, Table, Text, Tooltip, Title, Group, Progress, Center } from '@mantine/core';
import { Download } from 'tabler-icons-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { IModule } from '../modules';
import { useConfig } from '../../../tools/state';
import { AddItemShelfButton } from '../../AppShelf/AddAppShelfItem';

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
  const qBittorrentService = config.services
    .filter((service) => service.type === 'qBittorrent')
    .at(0);
  const hideComplete: boolean =
    (config?.modules?.[DownloadsModule.title]?.options?.hidecomplete?.value as boolean) ?? false;

  const [torrents, setTorrents] = useState<NormalizedTorrent[]>([]);

  useEffect(() => {
    if (qBittorrentService) {
      axios.post('/api/modules/downloads', { ...qBittorrentService }).then((res) => {
        setTorrents(res.data.torrents);
      });
      setInterval(() => {
        axios.post('/api/modules/downloads', { ...qBittorrentService }).then((res) => {
          setTorrents(res.data.torrents);
        });
      }, 3000);
    }
  }, [config.modules]);

  if (!qBittorrentService) {
    return (
      <Group direction="column">
        <Title>Critical: No qBittorrent instance found in services.</Title>
        <Group>
          <Title order={3}>Add a qBittorrent service to view current downloads</Title>
          <AddItemShelfButton />
        </Group>
      </Group>
    );
  }

  if (torrents.length === 0) {
    return (
      <Center>
        <Loader />
      </Center>
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

  const rows = torrents.map((torrent) => {
    if (torrent.progress === 1 && hideComplete) {
      return null;
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
    <Group noWrap direction="column">
      <Title order={4}>Your torrents</Title>
      <Table highlightOnHover>
        <thead>{ths}</thead>
        <tbody>{rows}</tbody>
      </Table>
    </Group>
  );
}
