import { type MRT_ColumnDef, MRT_Table, useMantineReactTable } from 'mantine-react-table';
import {
  Badge,
  Center,
  createStyles,
  Flex,
  Group,
  Loader,
  Popover,
  Progress,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconFileDownload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { MIN_WIDTH_MOBILE } from '~/constants/constants';
import { calculateETA } from '~/tools/client/calculateEta';
import { humanFileSize } from '~/tools/humanFileSize';
import {
  NormalizedDownloadQueueResponse,
  TorrentTotalDownload,
} from '~/types/api/downloads/queue/NormalizedDownloadQueueResponse';

import { useGetDownloadClientsQueue } from '../download-speed/useGetNetworkSpeed';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { TorrentQueuePopover } from './TorrentQueueItem';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const definition = defineWidget({
  id: 'torrents-status',
  icon: IconFileDownload,
  options: {
    displayCompletedTorrents: {
      type: 'switch',
      defaultValue: true,
    },
    displayActiveTorrents: {
      type: 'switch',
      defaultValue: true,
    },
    speedLimitOfActiveTorrents: {
      // Unit : kB/s
      type: 'number',
      defaultValue: 10,
    },
    displayStaleTorrents: {
      type: 'switch',
      defaultValue: true,
    },
    labelFilterIsWhitelist: {
      type: 'switch',
      defaultValue: true,
    },
    labelFilter: {
      type: 'multiple-text',
      defaultValue: [] as string[],
    },
    displayRatioWithFilter: {
      type: 'switch',
      defaultValue: true,
      info: true,
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
  const { width, ref } = useElementSize();

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

  let torrents: TorrentTotalDownload['torrents'] = [];
  if (!(isError || !data || data.apps.length === 0 || Object.values(data.apps).length < 1)) {
    torrents = data.apps.flatMap((app) => (app.type === 'torrent' ? app.torrents : []));
  }

  const filteredTorrents = filterTorrents(widget, torrents);


  const difference = new Date().getTime() - dataUpdatedAt;
  const duration = dayjs.duration(difference, 'ms');
  const humanizedDuration = duration.humanize();

  const ratioGlobal = getTorrentsRatio(widget, torrents, false);
  const ratioWithFilter = getTorrentsRatio(widget, torrents, true);

  const columns = useMemo<MRT_ColumnDef<TorrentTotalDownload['torrents'][0]>[]>(() => [
    {
      id: 'dateAdded',
      accessorFn: (row) => new Date(row.dateAdded),
      header: 'dateAdded',
      maxSize: 1,
    },
    {
      accessorKey: 'name',
      header: t('card.table.header.name'),
      Cell: ({ cell, row }) => (
        <Popover
          withArrow
          withinPortal
          radius="lg"
          shadow="sm"
          transitionProps={{
            transition: 'pop',
          }}
        >
          <Popover.Target>
            <Text
              maw={'30vw'}
              size="xs"
              lineClamp={1}
            >
              {String(cell.getValue())}
            </Text>
          </Popover.Target>
          <Popover.Dropdown>
            <TorrentQueuePopover torrent={row.original} app={undefined} />
          </Popover.Dropdown>
        </Popover>
      ),
      maxSize: 1,
      size: 1,
    },
    {
      accessorKey: 'totalSelected',
      header: t('card.table.header.size'),
      Cell: ({ cell }) => formatSize(Number(cell.getValue())),
      sortDescFirst: true,
      maxSize: 1,
    },
    {
      accessorKey: 'uploadSpeed',
      header: t('card.table.header.upload'),
      Cell: ({ cell }) => formatSpeed(Number(cell.getValue())),
      sortDescFirst: true,
      maxSize: 1,
    },
    {
      accessorKey: 'downloadSpeed',
      header: t('card.table.header.download'),
      Cell: ({ cell }) => formatSpeed(Number(cell.getValue())),
      sortDescFirst: true,
      maxSize: 1,
    },
    {
      accessorKey: 'eta',
      header: t('card.table.header.estimatedTimeOfArrival'),
      Cell: ({ cell }) => formatETA(Number(cell.getValue())),
      sortDescFirst: true,
      maxSize: 1,
    },
    {
      accessorKey: 'progress',
      header: t('card.table.header.progress'),
      maxSize: 1,
      Cell: ({ cell, row }) => (
        <Flex>
          <Text className={useStyles().classes.noTextBreak}>{(Number(cell.getValue()) * 100).toFixed(1)}%</Text>
          <Progress
            radius="lg"
            color={
              Number(cell.getValue()) === 1 ? 'green' : row.original.state === 'paused' ? 'yellow' : 'blue'
            }
            value={Number(cell.getValue()) * 100}
            size="lg"
          />,
        </Flex>),
      sortDescFirst: true,
    },
  ], []);

  const torrentsTable = useMantineReactTable({
    columns,
    data: filteredTorrents,
    enablePagination: false,
    enableBottomToolbar: false,
    enableMultiSort: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: true,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      density: 'xs',
      sorting: [{ id: 'dateAdded', desc: true }],
      columnVisibility: {
        isCompleted: false,
        dateAdded: false,
        uploadSpeed: false,
        downloadSpeed: false,
        eta: false,
      },
    },
    state: {
      showColumnFilters: false,
      showGlobalFilter: false,
      density: 'xs',
      columnVisibility: {
        isCompleted: false,
        dateAdded: false,
        uploadSpeed: width > MIN_WIDTH_MOBILE,
        downloadSpeed: width > MIN_WIDTH_MOBILE,
        eta: width > MIN_WIDTH_MOBILE,
      },
    },
  });


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
          <Text color="dimmed">{t('card.loading.description')}</Text>
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

  return (
    <Flex direction="column" sx={{ height: '100%' }} ref={ref}>
      <ScrollArea style={{ flexGrow: 1 }}>
        <MRT_Table table={torrentsTable} />
      </ScrollArea>
      <Group spacing="sm">
        {data.apps.some((x) => !x.success) && (
          <Badge variant="dot" color="red">
            {t('card.footer.error')}
          </Badge>
        )}
        <Text color="dimmed" size="xs">
          {t('card.footer.lastUpdated', { time: humanizedDuration })}
          {` - ${t('card.footer.ratioGlobal')} : ${
            ratioGlobal === -1 ? '∞' : ratioGlobal.toFixed(2)
          }`}
          {widget.properties.displayRatioWithFilter &&
            ` - ${t('card.footer.ratioWithFilter')} : ${
              ratioWithFilter === -1 ? '∞' : ratioWithFilter.toFixed(2)
            }`}
        </Text>
      </Group>
    </Flex>
  );
}

export const filterTorrents = (widget: ITorrent, torrents: TorrentTotalDownload['torrents']) => {
  let result = torrents;
  if (!widget.properties.displayCompletedTorrents) {
    result = result.filter(
      (torrent) =>
        !torrent.isCompleted ||
        (widget.properties.displayActiveTorrents &&
          torrent.uploadSpeed > widget.properties.speedLimitOfActiveTorrents * 1024),
    );
  }

  if (widget.properties.labelFilter.length > 0) {
    result = filterTorrentsByLabels(
      result,
      widget.properties.labelFilter,
      widget.properties.labelFilterIsWhitelist,
    );
  }

  result = filterStaleTorrent(widget, result);

  return result;
};

const filterStaleTorrent = (widget: ITorrent, torrents: TorrentTotalDownload['torrents']) => {
  if (widget.properties.displayStaleTorrents) {
    return torrents;
  }

  return torrents.filter((torrent) => torrent.isCompleted || torrent.downloadSpeed > 0);
};

const filterTorrentsByLabels = (
  torrents: TorrentTotalDownload['torrents'],
  labels: string[],
  isWhitelist: boolean,
) => {
  if (isWhitelist) {
    return torrents.filter((torrent) => torrent.label && labels.includes(torrent.label));
  }

  return torrents.filter((torrent) => !labels.includes(torrent.label as string));
};

export const getTorrentsRatio = (
  widget: ITorrent,
  torrents: TorrentTotalDownload['torrents'],
  applyAllFilter: boolean,
) => {
  if (applyAllFilter) {
    torrents = filterTorrents(widget, torrents);
  } else if (widget.properties.labelFilter.length > 0) {
    torrents = filterTorrentsByLabels(
      torrents,
      widget.properties.labelFilter,
      widget.properties.labelFilterIsWhitelist,
    );
  }

  let totalDownloadedSum = torrents.reduce(
    (sum, torrent) => sum + torrent.totalDownloaded,
    0,
  );

  return totalDownloadedSum > 0
    ? torrents.reduce((sum, torrent) => sum + torrent.totalUploaded, 0) /
    totalDownloadedSum
    : -1;
};

const formatSize = (sizeInBytes: number) => {
  return humanFileSize(sizeInBytes, false);
};

const formatSpeed = (speedInBytesPerSecond: number) => {
  return `${humanFileSize(speedInBytesPerSecond, false)}/s`;
};

const formatETA = (seconds: number) => {
  return calculateETA(seconds);
};

const useStyles = createStyles(() => ({
  noTextBreak: {
    whiteSpace: 'nowrap',
  },
}));

export default definition;
