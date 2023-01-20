import { NormalizedTorrent } from '@ctrl/shared-torrent';
import { Text, Title, Group, useMantineTheme, Box, Card, ColorSwatch, Stack } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { linearGradientDef } from '@nivo/core';
import { Datum, ResponsiveLine } from '@nivo/line';
import { IconArrowsUpDown } from '@tabler/icons';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useConfigContext } from '../../config/provider';
import { useSetSafeInterval } from '../../hooks/useSetSafeInterval';
import { humanFileSize } from '../../tools/humanFileSize';
import { NormalizedTorrentListResponse } from '../../types/api/NormalizedTorrentListResponse';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'dlspeed',
  icon: IconArrowsUpDown,
  options: {},

  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 6,
  },
  component: TorrentNetworkTrafficTile,
});

export type ITorrentNetworkTraffic = IWidget<typeof definition['id'], typeof definition>;

interface TorrentNetworkTrafficTileProps {
  widget: ITorrentNetworkTraffic;
}

function TorrentNetworkTrafficTile({ widget }: TorrentNetworkTrafficTileProps) {
  const { t } = useTranslation(`modules/${definition.id}`);
  const { colors } = useMantineTheme();
  const setSafeInterval = useSetSafeInterval();
  const { configVersion, config } = useConfigContext();

  const [torrentHistory, torrentHistoryHandlers] = useListState<TorrentHistory>([]);
  const [torrents, setTorrents] = useState<NormalizedTorrent[]>([]);

  const downloadServices =
    config?.apps.filter(
      (app) =>
        app.integration.type === 'qBittorrent' ||
        app.integration.type === 'transmission' ||
        app.integration.type === 'deluge'
    ) ?? [];
  const totalDownloadSpeed = torrents.reduce((acc, torrent) => acc + torrent.downloadSpeed, 0);
  const totalUploadSpeed = torrents.reduce((acc, torrent) => acc + torrent.uploadSpeed, 0);

  useEffect(() => {
    if (downloadServices.length === 0) return;
    const interval = setSafeInterval(() => {
      // Send one request with each download service inside
      axios
        .post('/api/modules/torrents')
        .then((response) => {
          const responseData: NormalizedTorrentListResponse = response.data;
          setTorrents(responseData.torrents.flatMap((x) => x.torrents));
        })
        .catch((error) => {
          if (error.status === 401) return;
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
  }, [configVersion]);

  useEffect(() => {
    torrentHistoryHandlers.append({
      x: Date.now(),
      down: totalDownloadSpeed,
      up: totalUploadSpeed,
    });
  }, [totalDownloadSpeed, totalUploadSpeed]);

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
          <ColorSwatch size={12} color={colors.green[5]} />
          <Text>
            {t('card.lineChart.totalDownload', { download: humanFileSize(totalDownloadSpeed) })}
          </Text>
        </Group>
        <Group>
          <ColorSwatch size={12} color={colors.blue[5]} />
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
                      <ColorSwatch size={10} color={colors.green[5]} />
                      <Text size="md">
                        {t('card.lineChart.download', { download: humanFileSize(Download) })}
                      </Text>
                    </Group>
                    <Group>
                      <ColorSwatch size={10} color={colors.blue[5]} />
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
          colors={[colors.blue[5], colors.green[5]]}
        />
      </Box>
    </Stack>
  );
}

export default definition;

interface TorrentHistory {
  x: number;
  up: number;
  down: number;
}
