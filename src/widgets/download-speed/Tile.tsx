import {
  Avatar,
  Box,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useElementSize, useListState } from '@mantine/hooks';
import { linearGradientDef } from '@nivo/core';
import { Datum, ResponsiveLine, Serie } from '@nivo/line';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { AppAvatar } from '~/components/AppAvatar';
import { useConfigContext } from '~/config/provider';
import { useColorTheme } from '~/tools/color';
import { humanFileSize } from '~/tools/humanFileSize';
import {
  NormalizedDownloadQueueResponse,
  TorrentTotalDownload,
} from '~/types/api/downloads/queue/NormalizedDownloadQueueResponse';

import definition, { ITorrentNetworkTraffic } from './TorrentNetworkTrafficTile';
import { useGetDownloadClientsQueue } from './useGetNetworkSpeed';

interface TorrentNetworkTrafficTileProps {
  widget: ITorrentNetworkTraffic;
}

export default function TorrentNetworkTrafficTile({ widget }: TorrentNetworkTrafficTileProps) {
  const { config } = useConfigContext();
  const { ref: refRoot, height: heightRoot } = useElementSize();
  const { ref: refTitle, height: heightTitle } = useElementSize();
  const { ref: refFooter, height: heightFooter } = useElementSize();
  const { primaryColor, secondaryColor } = useColorTheme();
  const { t } = useTranslation(`modules/${definition.id}`);

  const [clientDataHistory, setClientDataHistory] = useListState<NormalizedDownloadQueueResponse>();

  const { data, dataUpdatedAt } = useGetDownloadClientsQueue();

  useEffect(() => {
    if (data) {
      setClientDataHistory.append(data);
    }

    if (clientDataHistory.length < 30) {
      return;
    }
    setClientDataHistory.remove(0);
  }, [dataUpdatedAt]);

  if (!data) {
    return null;
  }

  const recoredAppsOverTime = clientDataHistory.flatMap((x) => x.apps.map((app) => app));

  // removing duplicates the "naive" way: https://stackoverflow.com/a/9229821/15257712
  const uniqueRecordedAppsOverTime = recoredAppsOverTime
    .map((x) => x.appId)
    .filter((item, position) => recoredAppsOverTime.map((y) => y.appId).indexOf(item) === position);

  const lineChartData: Serie[] = uniqueRecordedAppsOverTime.flatMap((appId) => {
    const records = recoredAppsOverTime.filter((x) => x.appId === appId);

    const series: Serie[] = [
      {
        id: `download_${appId}`,
        data: records.map((record, index) => ({
          x: index,
          y: record.totalDownload,
        })),
      },
    ];

    if (records.some((x) => x.type === 'torrent')) {
      const torrentRecords = records.map((record, index): Datum | null => {
        if (record.type !== 'torrent') {
          return null;
        }

        return {
          x: index,
          y: record.totalUpload,
        };
      });
      const filteredRecords = torrentRecords.filter((x) => x !== null) as Datum[];
      series.push({
        id: `upload_${appId}`,
        data: filteredRecords,
      });
    }

    return series;
  });

  const totalDownload = uniqueRecordedAppsOverTime
    .map((appId) => {
      const records = recoredAppsOverTime.filter((x) => x.appId === appId);
      const lastRecord = records.at(-1);
      return lastRecord?.totalDownload ?? 0;
    })
    .reduce((acc, n) => acc + n, 0);

  const totalUpload = uniqueRecordedAppsOverTime
    .map((appId) => {
      const records = recoredAppsOverTime.filter((x) => x.appId === appId && x.type === 'torrent');
      const lastRecord = records.at(-1) as TorrentTotalDownload;
      return lastRecord?.totalUpload ?? 0;
    })
    .reduce((acc, n) => acc + n, 0);

  const graphHeight = heightRoot - heightFooter - heightTitle;

  const { colors } = useMantineTheme();

  return (
    <Stack ref={refRoot} style={{ height: '100%' }}>
      <Group ref={refTitle}>
        <IconDownload />
        <Title order={4}>{t('card.lineChart.title')}</Title>
      </Group>
      <Box
        style={{
          height: graphHeight,
          width: '100%',
          position: 'relative',
        }}
      >
        <Box style={{ height: '100%', width: '100%', position: 'absolute' }}>
          <ResponsiveLine
            isInteractive
            enableSlices="x"
            sliceTooltip={({ slice }) => {
              const { points } = slice;

              const recordsFromPoints = uniqueRecordedAppsOverTime.map((appId) => {
                const records = recoredAppsOverTime.filter((x) => x.appId === appId);
                const point = points.find((x) => x.id.includes(appId));
                const pointIndex = Number(point?.data.x) ?? 0;
                const color = point?.serieColor;
                return {
                  record: records[pointIndex],
                  color,
                };
              });

              return (
                <Card p="xs" radius="md" withBorder>
                  <Card.Section p="xs">
                    <Stack spacing="xs">
                      {recordsFromPoints.map((entry, index) => {
                        const app = config?.apps.find((x) => x.id === entry.record.appId);

                        if (!app) {
                          return null;
                        }

                        return (
                          <Group key={`download-client-tooltip-${index}`}>
                            <AppAvatar iconUrl={app.appearance.iconUrl} />

                            <Stack spacing={0}>
                              <Text size="sm">{app.name}</Text>
                              <Group>
                                <Group spacing="xs">
                                  <IconDownload opacity={0.6} size={14} />
                                  <Text size="xs" color="dimmed">
                                    {humanFileSize(entry.record.totalDownload, false)}
                                  </Text>
                                </Group>

                                {entry.record.type === 'torrent' && (
                                  <Group spacing="xs">
                                    <IconUpload opacity={0.6} size={14} />
                                    <Text size="xs" color="dimmed">
                                      {humanFileSize(entry.record.totalUpload, false)}
                                    </Text>
                                  </Group>
                                )}
                              </Group>
                            </Stack>
                          </Group>
                        );
                      })}
                    </Stack>
                  </Card.Section>
                </Card>
              );
            }}
            data={lineChartData}
            curve="monotoneX"
            yFormat=" >-.2f"
            axisLeft={null}
            axisBottom={null}
            axisRight={null}
            enablePoints={false}
            enableGridX={false}
            enableGridY={false}
            enableArea
            defs={[
              linearGradientDef('gradientA', [
                { offset: 0, color: 'inherit' },
                { offset: 100, color: 'inherit', opacity: 0 },
              ]),
            ]}
            colors={lineChartData.flatMap((data) =>
              data.id.toString().startsWith('upload_')
                ? colors[secondaryColor][5]
                : colors[primaryColor][5]
            )}
            fill={[{ match: '*', id: 'gradientA' }]}
            margin={{ bottom: 5 }}
            animate={false}
          />
        </Box>
      </Box>

      <Group position="apart" ref={refFooter}>
        <Group>
          <Group spacing="xs">
            <IconDownload color={colors[primaryColor][5]} opacity={0.6} size={18} />
            <Text color="dimmed" size="sm">
              {humanFileSize(totalDownload, false)}
            </Text>
          </Group>
          <Group spacing="xs">
            <IconUpload color={colors[secondaryColor][5]} opacity={0.6} size={18} />
            <Text color="dimmed" size="sm">
              {humanFileSize(totalUpload, false)}
            </Text>
          </Group>
        </Group>
        <Avatar.Group>
          {uniqueRecordedAppsOverTime.map((appId, index) => {
            const app = config?.apps.find((x) => x.id === appId);

            if (!app) {
              return null;
            }

            return (
              <Tooltip
                label={app.name}
                key={`download-client-app-tooltip-${index}`}
                withArrow
                withinPortal
              >
                <AppAvatar iconUrl={app.appearance.iconUrl} />
              </Tooltip>
            );
          })}
        </Avatar.Group>
      </Group>
    </Stack>
  );
}
