import { Center, createStyles, Group, Stack, Text, Title } from '@mantine/core';
import { IconUnlink } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../config/provider';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { DashDotCompactNetwork, DashDotInfo } from './DashDotCompactNetwork';
import { DashDotCompactStorage } from './DashDotCompactStorage';
import { DashDotGraph } from './DashDotGraph';

const definition = defineWidget({
  id: 'dashdot',
  icon: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/dashdot.png',
  options: {
    cpuMultiView: {
      type: 'switch',
      defaultValue: false,
    },
    storageMultiView: {
      type: 'switch',
      defaultValue: false,
    },
    useCompactView: {
      type: 'switch',
      defaultValue: true,
    },
    usePercentages: {
      type: 'switch',
      defaultValue: false,
    },
    graphs: {
      type: 'multi-select',
      defaultValue: ['cpu', 'memory'],
      data: [
        // ['cpu', 'memory', 'storage', 'network', 'gpu'], into { label, value }
        { label: 'CPU', value: 'cpu' },
        { label: 'Memory', value: 'memory' },
        { label: 'Storage', value: 'storage' },
        { label: 'Network', value: 'network' },
        { label: 'GPU', value: 'gpu' },
      ],
    },
    url: {
      type: 'text',
      defaultValue: '',
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 14,
  },
  component: DashDotTile,
});

export type IDashDotTile = IWidget<(typeof definition)['id'], typeof definition>;

interface DashDotTileProps {
  widget: IDashDotTile;
}

function DashDotTile({ widget }: DashDotTileProps) {
  const { classes } = useDashDotTileStyles();
  const { t } = useTranslation('modules/dashdot');

  const dashDotUrl = widget.properties.url;
  const locationProtocol = window.location.protocol;
  const detectedProtocolDowngrade =
    locationProtocol === 'https:' && dashDotUrl.toLowerCase().startsWith('http:');

  const { data: info } = useDashDotInfo({
    dashDotUrl,
    enabled: !detectedProtocolDowngrade,
  });

  if (detectedProtocolDowngrade) {
    return (
      <Center h="100%">
        <Stack spacing="xs" align="center">
          <IconUnlink size={40} strokeWidth={1.2} />
          <Title order={5}>{t('card.errors.protocolDowngrade.title')}</Title>
          <Text align="center" size="sm">
          {t('card.errors.protocolDowngrade.text')}
          </Text>
        </Stack>
      </Center>
    );
  }

  const graphs = widget?.properties.graphs.map((graph) => ({
    id: graph,
    name: t(`card.graphs.${graph}.title`),
    twoSpan: ['network', 'gpu'].includes(graph),
    isMultiView:
      (graph === 'cpu' && widget.properties.cpuMultiView) ||
      (graph === 'storage' && widget.properties.storageMultiView),
  }));

  const isCompact = widget?.properties.useCompactView ?? false;

  const isCompactStorageVisible = graphs?.some((g) => g.id === 'storage' && isCompact);

  const isCompactNetworkVisible = graphs?.some((g) => g.id === 'network' && isCompact);

  const usePercentages = widget?.properties.usePercentages ?? false;

  const displayedGraphs = graphs?.filter(
    (g) => !isCompact || !['network', 'storage'].includes(g.id)
  );

  return (
    <>
      <Title order={3} mb="xs">
        {t('card.title')}
      </Title>
      {!info && <p>{t('card.errors.noInformation')}</p>}
      {info && (
        <div className={classes.graphsContainer}>
          <Group position="apart" w="100%">
            {isCompactStorageVisible && <DashDotCompactStorage info={info} />}
            {isCompactNetworkVisible && <DashDotCompactNetwork info={info} />}
          </Group>
          <Group position="center" w="100%" className={classes.graphsWrapper}>
            {displayedGraphs?.map((graph) => (
              <DashDotGraph
                key={graph.id}
                graph={graph}
                dashDotUrl={dashDotUrl}
                isCompact={isCompact}
                usePercentages={usePercentages}
              />
            ))}
          </Group>
        </div>
      )}
    </>
  );
}

const useDashDotInfo = ({ dashDotUrl, enabled }: { dashDotUrl: string; enabled: boolean }) => {
  const { name: configName } = useConfigContext();
  return useQuery({
    refetchInterval: 50000,
    queryKey: [
      'dashdot/info',
      {
        configName,
        dashDotUrl,
      },
    ],
    queryFn: () => fetchDashDotInfo(configName),
    enabled,
  });
};

const fetchDashDotInfo = async (configName: string | undefined) => {
  if (!configName) return {} as DashDotInfo;
  return (await (
    await axios.get('/api/modules/dashdot/info', { params: { configName } })
  ).data) as DashDotInfo;
};

export const useDashDotTileStyles = createStyles(() => ({
  graphsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 10,
  },
  graphsWrapper: {
    '& > *:nth-child(odd):last-child': {
      width: '100% !important',
      maxWidth: '100% !important',
    },
  },
}));

export default definition;
