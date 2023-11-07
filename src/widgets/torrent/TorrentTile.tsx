import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
} from 'mantine-react-table';

import { NormalizedTorrent, TorrentState } from '@ctrl/shared-torrent';
import {
  Badge,
  Center,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconFileDownload, IconInfoCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import { useCardStyles } from '~/components/layout/Common/useCardStyles';
import { MIN_WIDTH_MOBILE } from '~/constants/constants';
import { NormalizedDownloadQueueResponse } from '~/types/api/downloads/queue/NormalizedDownloadQueueResponse';
import { AppIntegrationType } from '~/types/app';
import { calculateETA } from '~/tools/client/calculateEta';
import { humanFileSize } from '~/tools/humanFileSize';

import { useGetDownloadClientsQueue } from '../download-speed/useGetNetworkSpeed';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { BitTorrentQueueItem } from './TorrentQueueItem';
import { ISODateString } from 'next-auth';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const downloadAppTypes: AppIntegrationType['type'][] = ['deluge', 'qBittorrent', 'transmission'];

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
  const { classes } = useCardStyles(true);

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

  let torrents: NormalizedTorrent[] = [];
  if(!(isError || !data || data.apps.length === 0 || Object.values(data.apps).length < 1)) { 
    torrents = data.apps.flatMap((app) => (app.type === 'torrent' ? app.torrents : []))
  }

  const filteredTorrents = filterTorrents(widget, torrents);

  const difference = new Date().getTime() - dataUpdatedAt;
  const duration = dayjs.duration(difference, 'ms');
  const humanizedDuration = duration.humanize();

  const ratioGlobal = getTorrentsRatio(widget, torrents, false);
  const ratioWithFilter = getTorrentsRatio(widget, torrents, true);

  const columns = useMemo<MRT_ColumnDef<NormalizedTorrent>[]>(() => [
    {
      id: "dateAdded",
      accessorFn: (row) => new Date(row.dateAdded),
      header: t('card.table.header.dateAdded'),
      sortDescFirst: true,
      enableMultiSort: true,
      Cell: ({ cell }) => convertToLocalDate(cell.getValue()),
    },
    {
      accessorKey: 'name',
      header: t('card.table.header.name'),
      sortDescFirst: true,
      enableMultiSort: true,
    },
    {
      accessorKey: 'totalSize',
      header: t('card.table.header.size'),
      Cell: ({ cell }) => formatSize(cell.getValue()),
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'uploadSpeed',
      header: t('card.table.header.upload'),
      Cell: ({ cell }) => formatSpeed(cell.getValue()),
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'downloadSpeed',
      header: t('card.table.header.download'),
      Cell: ({ cell }) => formatSpeed(cell.getValue()),
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'eta',
      header: t('card.table.header.estimatedTimeOfArrival'),
      Cell: ({ cell }) => formatETA(cell.getValue()),
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'progress',
      header: t('card.table.header.progress'),
      Cell: ({ cell }) => (100 * cell.getValue()).toFixed(0) + "%",
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'totalUploaded',
      header: t('card.table.header.totalUploaded'),
      Cell: ({ cell }) => formatSize(cell.getValue()),
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'totalDownloaded',
      header: t('card.table.header.totalDownloaded'),
      Cell: ({ cell }) => formatSize(cell.getValue()),
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'ratio',
      header: t('card.table.header.ratio'),
      Cell: ({ cell }) => cell.getValue().toFixed(2),
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorFn: (row) => `${row.totalSeeds} (${row.connectedSeeds})`,
      header: t('card.table.header.seeds'),
      id: "seeds",
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorFn: (row) => `${row.totalPeers} (${row.connectedPeers})`,
      header: t('card.table.header.peers'),
      id: "peers",
      sortDescFirst: true,
      enableMultiSort: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'label',
      header: t('card.table.header.label'),
      sortDescFirst: true,
      enableMultiSort: true,
    },
    {
      accessorKey: 'state',
      header: t('card.table.header.state'),
      sortDescFirst: true,
      enableMultiSort: true,
    },
    {
      accessorKey: 'stateMessage',
      header: t('card.table.header.stateMessage'),
      sortDescFirst: true,
      enableMultiSort: true,
    },
  ], []);


  const torrentsTable = useMantineReactTable({
    columns,
    data: filteredTorrents,
    enablePagination: false,
    enableBottomToolbar: false,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enablePinning: true,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      density: 'xs',
      sorting: [{ id: 'dateAdded', desc: true }],
      columnVisibility: {
        dateAdded: false,
        totalUploaded: false,
        totalDownloaded: false,
        ratio: false,
        seeds: false,
        peers: false,
        label: false,
        state: false,
        stateMessage: false,
      },
    },
    positionToolbarAlertBanner: 'bottom',
    mantineSearchTextInputProps: {
      placeholder: 'Search Torrents',
    },
    // ... Others options if necessary
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
      <ScrollArea sx={{ height: '100%', width: '100%' }} mb="xs">
        <MantineReactTable table={torrentsTable}>
          <MRT_GlobalFilterTextInput />
        </MantineReactTable>
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
  /* // OldTable
  return (
    <Flex direction="column" sx={{ height: '100%' }} ref={ref}>
      <ScrollArea sx={{ height: '100%', width: '100%' }} mb="xs">
        <Table striped highlightOnHover p="sm">
          <thead>
            <tr>
              <th style={{cursor: "pointer"}} onClick={() => requestSort('name')}>{t('card.table.header.name')}</th>
              <th style={{cursor: "pointer"}} onClick={() => requestSort('totalSize')}>{t('card.table.header.size')}</th>
              {width > MIN_WIDTH_MOBILE && (
                <th style={{cursor: "pointer"}} onClick={() => requestSort('downloadSpeed')}>
                  {t('card.table.header.download')}
                </th>
              )}
              {width > MIN_WIDTH_MOBILE && (
                <th style={{cursor: "pointer"}} onClick={() => requestSort('uploadSpeed')}>{t('card.table.header.upload')}</th>
              )}
              {width > MIN_WIDTH_MOBILE && (
                <th style={{cursor: "pointer"}} onClick={() => requestSort('eta')}>
                  {t('card.table.header.estimatedTimeOfArrival')}
                </th>
              )}
              <th style={{cursor: "pointer"}} onClick={() => requestSort('progress')}>{t('card.table.header.progress')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTorrents.map((torrent, index) => (
              <BitTorrentQueueItem key={index} torrent={torrent} width={width} app={undefined} />
            ))}

            {filteredTorrents.length !== torrents.length && (
              <tr className={classes.card}>
                <td colSpan={width > MIN_WIDTH_MOBILE ? 6 : 3}>
                  <Flex gap="xs" align="center" justify="center">
                    <IconInfoCircle opacity={0.7} size={18} />
                    <Text align="center" color="dimmed">
                      {t('card.table.body.filterHidingItems', {
                        count: torrents.length - filteredTorrents.length,
                      })}
                    </Text>
                  </Flex>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
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
  */
}

export const filterTorrents = (widget: ITorrent, torrents: NormalizedTorrent[]) => {
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

const filterStaleTorrent = (widget: ITorrent, torrents: NormalizedTorrent[]) => {
  if (widget.properties.displayStaleTorrents) {
    return torrents;
  }

  return torrents.filter((torrent) => torrent.isCompleted || torrent.downloadSpeed > 0);
};

const filterTorrentsByLabels = (
  torrents: NormalizedTorrent[],
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
  torrents: NormalizedTorrent[],
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

  let totalDownloadedSum = torrents.reduce(
    (sum, torrent) => sum + torrent.totalDownloaded,
    0
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

function convertToLocalDate(isoDateString: ISODateString) {
  const date = new Date(isoDateString);
  return date.toLocaleString();
}

export default definition;
