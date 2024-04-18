import {
  Badge,
  Center,
  Flex,
  Group,
  Popover,
  Progress,
  Stack,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconFileDownload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { type MRT_ColumnDef, MRT_TableContainer, useMantineReactTable } from 'mantine-react-table';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { MIN_WIDTH_MOBILE } from '~/constants/constants';
import { calculateETA } from '~/tools/client/calculateEta';
import { humanFileSize } from '~/tools/humanFileSize';
import {
  NormalizedDownloadQueueResponse,
  TorrentTotalDownload,
} from '~/types/api/downloads/queue/NormalizedDownloadQueueResponse';

import { useGetDownloadClientsQueue } from '../download-speed/useGetNetworkSpeed';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
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
    columnOrdering: {
      type: 'switch',
      defaultValue: true,
    },
    rowSorting: {
      type: 'switch',
      defaultValue: true,
    },
    columns: {
      type: 'multi-select',
      defaultValue: ['up', 'down', 'eta', 'progress'],
      data: [
        { value: 'up' },
        { value: 'down' },
        { value: 'eta' },
        { value: 'progress' },
        { value: 'date' },
      ],
    },
    nameColumnSize: {
      type: 'slider',
      defaultValue: 2,
      min: 1,
      max: 4,
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

  const [opened, setOpened] = useState<number>(-1);

  const columns = useMemo<MRT_ColumnDef<TorrentTotalDownload['torrents'][0]>[]>(
    () => [
      {
        id: 'dateAdded',
        accessorFn: (row) => new Date(row.dateAdded),
        Cell: ({ cell }) => (
          <Stack spacing={0}>
            <Text>{dayjs(cell.getValue() as Date).format('YYYY/MM/DD')}</Text>
            <Text>{dayjs(cell.getValue() as Date).format('HH:mm')}</Text>
          </Stack>
        ),
        header: t('card.table.header.dateAdded'),
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
            opened={opened === row.index}
            onChange={(o) => setOpened(() => (o ? row.index : -1))}
          >
            <Popover.Target>
              <Text maw={'30vw'} size="xs" lineClamp={1}>
                {String(cell.getValue())}
              </Text>
            </Popover.Target>
            <Popover.Dropdown>
              <TorrentQueuePopover torrent={row.original} app={undefined} />
            </Popover.Dropdown>
          </Popover>
        ),
        maxSize: widget.properties.nameColumnSize,
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
          <Flex direction="column" w="100%">
            <Text className={useStyles().classes.noTextBreak}>
              {(Number(cell.getValue()) * 100).toPrecision(3)}%
            </Text>
            <Progress
              radius="lg"
              color={
                Number(cell.getValue()) === 1
                  ? 'green'
                  : row.original.state === 'paused'
                    ? 'yellow'
                    : 'blue'
              }
              value={Number(cell.getValue()) * 100}
              size="md"
            />
          </Flex>
        ),
        sortDescFirst: true,
      },
    ],
    [opened]
  );

  const torrentsTable = useMantineReactTable({
    columns,
    data: filteredTorrents,
    enablePagination: false,
    enableBottomToolbar: false,
    enableMultiSort: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableRowVirtualization: true,
    rowVirtualizerProps: { overscan: 20 },
    mantineTableContainerProps: { sx: { scrollbarWidth: 'none', flex: '1', borderRadius: '0.5rem' } },
    mantineTableBodyCellProps: { style: { background: 'transparent' } },
    mantineTableHeadCellProps: {
      style: { borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' },
    },
    mantineTableHeadRowProps: {
      style: { borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' },
    },
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => setOpened((o) => (o === row.index ? -1 : row.index)),
    }),
    enableColumnOrdering: widget.properties.columnOrdering,
    enableSorting: widget.properties.rowSorting,
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
        dateAdded: widget.properties.columns.includes('date') && width > MIN_WIDTH_MOBILE,
        uploadSpeed: widget.properties.columns.includes('up') && width > MIN_WIDTH_MOBILE,
        downloadSpeed: widget.properties.columns.includes('down') && width > MIN_WIDTH_MOBILE,
        eta: widget.properties.columns.includes('eta') && width > MIN_WIDTH_MOBILE,
        progress: widget.properties.columns.includes('progress'),
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
    return <WidgetLoading />;
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
    <Flex direction="column" sx={{ height: '100%', isolation: 'isolate' }} ref={ref}>
      <MRT_TableContainer table={torrentsTable} />
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
          torrent.uploadSpeed > widget.properties.speedLimitOfActiveTorrents * 1024)
    );
  }

  if (widget.properties.labelFilter.length > 0) {
    result = filterTorrentsByLabels(
      result,
      widget.properties.labelFilter,
      widget.properties.labelFilterIsWhitelist
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
  isWhitelist: boolean
) => {
  if (isWhitelist) {
    return torrents.filter((torrent) => torrent.label && labels.includes(torrent.label));
  }

  return torrents.filter((torrent) => !labels.includes(torrent.label as string));
};

export const getTorrentsRatio = (
  widget: ITorrent,
  torrents: TorrentTotalDownload['torrents'],
  applyAllFilter: boolean
) => {
  if (applyAllFilter) {
    torrents = filterTorrents(widget, torrents);
  } else if (widget.properties.labelFilter.length > 0) {
    torrents = filterTorrentsByLabels(
      torrents,
      widget.properties.labelFilter,
      widget.properties.labelFilterIsWhitelist
    );
  }

  let totalDownloadedSum = torrents.reduce((sum, torrent) => sum + torrent.totalDownloaded, 0);

  return totalDownloadedSum > 0
    ? torrents.reduce((sum, torrent) => sum + torrent.totalUploaded, 0) / totalDownloadedSum
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
