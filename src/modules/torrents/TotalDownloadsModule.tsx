import { Text, Title, Group, useMantineTheme, Box, Card, ColorSwatch, Stack } from '@mantine/core';
import { IconDownload as Download } from '@tabler/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { linearGradientDef } from '@nivo/core';
import { useTranslation } from 'next-i18next';
import { Datum, ResponsiveLine } from '@nivo/line';
import { useListState } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { AddItemShelfButton } from '../../components/AppShelf/AddAppShelfItem';
import { useConfig } from '../../tools/state';
import { humanFileSize } from '../../tools/humanFileSize';
import { IModule } from '../ModuleTypes';
import { useSetSafeInterval } from '../../tools/hooks/useSetSafeInterval';

export const TotalDownloadsModule: IModule = {
  title: 'Download Speed',
  icon: Download,
  component: TotalDownloadsComponent,
  id: 'dlspeed',
};

interface torrentHistory {
  x: number;
  up: number;
  down: number;
}

export default function TotalDownloadsComponent() {
  const setSafeInterval = useSetSafeInterval();
  const { config } = useConfig();
  const downloadServices =
    config.services.filter(
      (service) =>
        service.type === 'qBittorrent' ||
        service.type === 'Transmission' ||
        service.type === 'Deluge'
    ) ?? [];
  const { t } = useTranslation(`modules/${TotalDownloadsModule.id}`);

  const [torrentHistory, torrentHistoryHandlers] = useListState<torrentHistory>([]);
  const [torrents, setTorrents] = useState<NormalizedTorrent[]>([]);

  const totalDownloadSpeed = torrents.reduce((acc, torrent) => acc + torrent.downloadSpeed, 0);
  const totalUploadSpeed = torrents.reduce((acc, torrent) => acc + torrent.uploadSpeed, 0);
  useEffect(() => {
    if (downloadServices.length === 0) return;
    const interval = setSafeInterval(() => {
      // Send one request with each download service inside
      axios
        .post('/api/modules/torrents')
        .then((response) => {
          setTorrents(response.data);
        })
        .catch((error) => {
          setTorrents([]);
          // eslint-disable-next-line no-console
          console.error('Error while fetching torrents', error.response.data);
          showNotification({
            title: 'Torrent speed module failed to fetch torrents',
            autoClose: 1000,
            disallowClose: true,
            id: 'fail-torrent-speed-module',
            color: 'red',
            message:
              'Error fetching torrents, please check your config for any potential errors, check the console for more info',
          });
          clearInterval(interval);
        });
    }, 1000);
  }, [config.services]);

  useEffect(() => {
    torrentHistoryHandlers.append({
      x: Date.now(),
      down: totalDownloadSpeed,
      up: totalUploadSpeed,
    });
  }, [totalDownloadSpeed, totalUploadSpeed]);

  if (downloadServices.length === 0) {
    return (
      <Group>
        <Title order={4}>{t('card.errors.noDownloadClients.title')}</Title>
        <div>
          <AddItemShelfButton
            style={{
              float: 'inline-end',
            }}
          />
          {t('card.errors.noDownloadClients.text')}
        </div>
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
    <Stack>
      <Title order={4}>{t('card.lineChart.title')}</Title>
      <Stack>
        <Group>
          <ColorSwatch size={12} color={theme.colors.green[5]} />
          <Text>
            {t('card.lineChart.totalDownload', { download: humanFileSize(totalDownloadSpeed) })}
          </Text>
        </Group>
        <Group>
          <ColorSwatch size={12} color={theme.colors.blue[5]} />
          <Text>
            {t('card.lineChart.totalUpload', { upload: humanFileSize(totalUploadSpeed) })}
          </Text>
        </Group>
      </Stack>
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
                <Text size="md">{t('card.lineChart.timeSpan', { seconds: roundedSeconds })}</Text>
                <Card.Section p="sm">
                  <Stack>
                    <Group>
                      <ColorSwatch size={10} color={theme.colors.green[5]} />
                      <Text size="md">
                        {t('card.lineChart.download', { download: humanFileSize(Download) })}
                      </Text>
                    </Group>
                    <Group>
                      <ColorSwatch size={10} color={theme.colors.blue[5]} />
                      <Text size="md">
                        {t('card.lineChart.upload', { upload: humanFileSize(Upload) })}
                      </Text>
                    </Group>
                  </Stack>
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
    </Stack>
  );
}
