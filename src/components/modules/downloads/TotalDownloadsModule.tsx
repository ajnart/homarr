import { Text, Title, Group, useMantineTheme, Box, Card, ColorSwatch } from '@mantine/core';
import { IconDownload as Download } from '@tabler/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { linearGradientDef } from '@nivo/core';
import { Datum, ResponsiveLine } from '@nivo/line';
import { useListState } from '@mantine/hooks';
import { AddItemShelfButton } from '../../AppShelf/AddAppShelfItem';
import { useConfig } from '../../../tools/state';
import { IModule } from '../modules';

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(initialBytes: number, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024;
  let bytes = initialBytes;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kb', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    u += 1;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return `${bytes.toFixed(dp)} ${units[u]}`;
}

export const TotalDownloadsModule: IModule = {
  title: 'Download Speed',
  description: 'Show the current download speed of supported services',
  icon: Download,
  component: TotalDownloadsComponent,
};

interface torrentHistory {
  x: number;
  up: number;
  down: number;
}

export default function TotalDownloadsComponent() {
  const { config } = useConfig();
  const qBittorrentService = config.services
    .filter((service) => service.type === 'qBittorrent')
    .at(0);
  const delugeService = config.services.filter((service) => service.type === 'Deluge').at(0);

  const [delugeTorrents, setDelugeTorrents] = useState<NormalizedTorrent[]>([]);
  const [torrentHistory, torrentHistoryHandlers] = useListState<torrentHistory>([]);
  const [qBittorrentTorrents, setqBittorrentTorrents] = useState<NormalizedTorrent[]>([]);

  const torrents: NormalizedTorrent[] = [];
  delugeTorrents.forEach((delugeTorrent) =>
    torrents.push({ ...delugeTorrent, progress: delugeTorrent.progress / 100 })
  );
  qBittorrentTorrents.forEach((torrent) => torrents.push(torrent));

  const totalDownloadSpeed = torrents.reduce((acc, torrent) => acc + torrent.downloadSpeed, 0);
  const totalUploadSpeed = torrents.reduce((acc, torrent) => acc + torrent.uploadSpeed, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Get the current download speed of qBittorrent.
      if (qBittorrentService) {
        axios
          .post('/api/modules/downloads?dlclient=qbit', { ...qBittorrentService })
          .then((res) => {
            setqBittorrentTorrents(res.data.torrents);
          });
        if (delugeService) {
          axios.post('/api/modules/downloads?dlclient=deluge', { ...delugeService }).then((res) => {
            setDelugeTorrents(res.data.torrents);
          });
        }
      }
    }, 1000);
  }, [config.modules]);

  useEffect(() => {
    torrentHistoryHandlers.append({
      x: Date.now(),
      down: totalDownloadSpeed,
      up: totalUploadSpeed,
    });
  }, [totalDownloadSpeed, totalUploadSpeed]);

  if (!qBittorrentService && !delugeService) {
    return (
      <Group direction="column">
        <Title order={4}>No supported download clients found!</Title>
        <Group noWrap>
          <Text>Add a download service to view your current downloads...</Text>
          <AddItemShelfButton />
        </Group>
      </Group>
    );
  }

  const theme = useMantineTheme();
  // Load the last 10 values from the history
  const history = torrentHistory.slice(-10);
  const chartDataUp = history.map((load, i) => ({
    x: load.x,
    y: load.up,
  })) as Datum[];
  const chartDataDown = history.map((load, i) => ({
    x: load.x,
    y: load.down,
  })) as Datum[];

  return (
    <Group noWrap direction="column" grow>
      <Title order={4}>Current download speed</Title>
      <Group direction="column">
        <Group>
          <ColorSwatch size={12} color={theme.colors.green[5]} />
          <Text>Download: {humanFileSize(totalDownloadSpeed)}/s</Text>
        </Group>
        <Group>
          <ColorSwatch size={12} color={theme.colors.blue[5]} />
          <Text>Upload: {humanFileSize(totalUploadSpeed)}/s</Text>
        </Group>
      </Group>
      <Box
        style={{
          height: 200,
          width: '100%',
        }}
      >
        <ResponsiveLine
          isInteractive
          enableSlices="x"
          sliceTooltip={({ slice }) => {
            const Download = slice.points[0].data.y as number;
            const Upload = slice.points[1].data.y as number;
            // Get the number of seconds since the last update.
            const seconds = (Date.now() - (slice.points[0].data.x as number)) / 1000;
            // Round to the nearest second.
            const roundedSeconds = Math.round(seconds);
            return (
              <Card p="sm" radius="md" withBorder>
                <Text size="md">{roundedSeconds} seconds ago</Text>
                <Card.Section p="sm">
                  <Group direction="column">
                    <Group>
                      <ColorSwatch size={10} color={theme.colors.green[5]} />
                      <Text size="md">Download: {humanFileSize(Download)}</Text>
                    </Group>
                    <Group>
                      <ColorSwatch size={10} color={theme.colors.blue[5]} />
                      <Text size="md">Upload: {humanFileSize(Upload)}</Text>
                    </Group>
                  </Group>
                </Card.Section>
              </Card>
            );
          }}
          data={[
            {
              id: 'downloads',
              data: chartDataUp,
            },
            {
              id: 'uploads',
              data: chartDataDown,
            },
          ]}
          curve="monotoneX"
          yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          enablePoints={false}
          animate={false}
          enableGridX={false}
          enableGridY={false}
          enableArea
          defs={[
            linearGradientDef('gradientA', [
              { offset: 0, color: 'inherit' },
              { offset: 100, color: 'inherit', opacity: 0 },
            ]),
          ]}
          fill={[{ match: '*', id: 'gradientA' }]}
          colors={[
            // Blue
            theme.colors.blue[5],
            // Green
            theme.colors.green[5],
          ]}
        />
      </Box>
    </Group>
  );
}
