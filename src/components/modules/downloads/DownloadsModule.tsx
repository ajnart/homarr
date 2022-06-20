import {
  Table,
  Text,
  Tooltip,
  Title,
  Group,
  Progress,
  Skeleton,
  ScrollArea,
  Center,
  Image,
} from '@mantine/core';
import { IconDownload as Download } from '@tabler/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { useViewportSize } from '@mantine/hooks';
import { IModule } from '../modules';
import { useConfig } from '../../../tools/state';
import { AddItemShelfButton } from '../../AppShelf/AddAppShelfItem';
import { useSetSafeInterval } from '../../../tools/hooks/useSetSafeInterval';
import { humanFileSize } from '../../../tools/humanFileSize';

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
  const { height, width } = useViewportSize();
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
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    if (downloadServices.length === 0) return;
    setSafeInterval(() => {
      // Send one request with each download service inside
      axios.post('/api/modules/downloads', { config }).then((response) => {
        setTorrents(response.data);
        setIsLoading(false);
      });
    }, 5000);
  }, [config.services]);

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

  if (isLoading) {
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
  const DEVICE_WIDTH = 576;
  const ths = (
    <tr>
      <th>Name</th>
      <th>Size</th>
      {width > 576 ? <th>Down</th> : ''}
      {width > 576 ? <th>Up</th> : ''}
      <th>ETA</th>
      <th>Progress</th>
    </tr>
  );
  // Convert Seconds to readable format.
  function calculateETA(givenSeconds: number) {
    // If its superior than one day return > 1 day
    if (givenSeconds > 86400) {
      return '> 1 day';
    }
    // Transform the givenSeconds into a readable format. e.g. 1h 2m 3s
    const hours = Math.floor(givenSeconds / 3600);
    const minutes = Math.floor((givenSeconds % 3600) / 60);
    const seconds = Math.floor(givenSeconds % 60);
    // Only show hours if it's greater than 0.
    const hoursString = hours > 0 ? `${hours}h ` : '';
    const minutesString = minutes > 0 ? `${minutes}m ` : '';
    const secondsString = seconds > 0 ? `${seconds}s` : '';
    return `${hoursString}${minutesString}${secondsString}`;
  }
  // Loop over qBittorrent torrents merging with deluge torrents
  const rows = torrents
    .filter((torrent) => !(torrent.progress === 1 && hideComplete))
    .map((torrent) => {
      const downloadSpeed = torrent.downloadSpeed / 1024 / 1024;
      const uploadSpeed = torrent.uploadSpeed / 1024 / 1024;
      const size = torrent.totalSelected;
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
            <Text size="xs">{humanFileSize(size)}</Text>
          </td>
          {width > 576 ? (
            <td>
              <Text size="xs">{downloadSpeed > 0 ? `${downloadSpeed.toFixed(1)} Mb/s` : '-'}</Text>
            </td>
          ) : (
            ''
          )}
          {width > 576 ? (
            <td>
              <Text size="xs">{uploadSpeed > 0 ? `${uploadSpeed.toFixed(1)} Mb/s` : '-'}</Text>
            </td>
          ) : (
            ''
          )}
          <td>
            <Text size="xs">{torrent.eta <= 0 ? '∞' : calculateETA(torrent.eta)}</Text>
          </td>
          <td>
            <Text>{(torrent.progress * 100).toFixed(1)}%</Text>
            <Progress
              radius="lg"
              color={
                torrent.progress === 1 ? 'green' : torrent.state === 'paused' ? 'yellow' : 'blue'
              }
              value={torrent.progress * 100}
              size="lg"
            />
          </td>
        </tr>
      );
    });

  const easteregg = (
    <Center style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image fit="cover" height={300} src="https://danjohnvelasco.github.io/images/empty.png" />
    </Center>
  );
  return (
    <Group noWrap grow direction="column" mt="xl">
      <ScrollArea sx={{ height: 300 }}>
        {rows.length > 0 ? (
          <Table highlightOnHover>
            <thead>{ths}</thead>
            <tbody>{rows}</tbody>
          </Table>
        ) : (
          easteregg
        )}
      </ScrollArea>
    </Group>
  );
}
