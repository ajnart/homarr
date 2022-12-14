import {
  Card,
  createStyles,
  Flex,
  Grid,
  Group,
  Stack,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { DashDotCompactNetwork } from './DashDotCompactNetwork';
import { DashDotCompactStorage } from './DashDotCompactStorage';
import { BaseTileProps } from '../type';
import { DashDotGraph } from './DashDotGraph';
import { DashDotIntegrationType } from '../../../../types/integration';
import { IntegrationsMenu } from '../Integrations/IntegrationsMenu';
import { useConfigContext } from '../../../../config/provider';
import { HomarrCardWrapper } from '../HomarrCardWrapper';

interface DashDotTileProps extends BaseTileProps {
  module: DashDotIntegrationType | undefined;
}

export const DashDotTile = ({ module, className }: DashDotTileProps) => {
  const { classes } = useDashDotTileStyles();
  const { t } = useTranslation('modules/dashdot');

  const dashDotUrl = module?.properties.url;

  const { data: info } = useDashDotInfo();

  const graphs = module?.properties.graphs.map((g) => ({
    id: g,
    name: t(`card.graphs.${g === 'ram' ? 'memory' : g}.title`),
    twoSpan: ['network', 'gpu'].includes(g),
    isMultiView:
      (g === 'cpu' && module.properties.isCpuMultiView) ||
      (g === 'storage' && module.properties.isStorageMultiView),
  }));

  const heading = (
    <Title order={3} mb="xs">
      {t('card.title')}
    </Title>
  );

  const menu = (
    <IntegrationsMenu<'dashDot'>
      module={module}
      integration="dashDot"
      options={module?.properties}
      labels={{
        isCpuMultiView: 'descriptor.settings.cpuMultiView.label',
        isStorageMultiView: 'descriptor.settings.storageMultiView.label',
        isCompactView: 'descriptor.settings.useCompactView.label',
        graphs: 'descriptor.settings.graphs.label',
        url: 'descriptor.settings.url.label',
      }}
    />
  );

  if (!dashDotUrl) {
    return (
      <HomarrCardWrapper className={className}>
        {menu}
        <div>
          {heading}
          <p>{t('card.errors.noService')}</p>
        </div>
      </HomarrCardWrapper>
    );
  }

  const isCompact = module?.properties.isCompactView ?? false;

  const isCompactStorageVisible = graphs?.some((g) => g.id === 'storage' && isCompact);

  const isCompactNetworkVisible = graphs?.some((g) => g.id === 'network' && isCompact);

  const displayedGraphs = graphs?.filter(
    (g) => !isCompact || !['network', 'storage'].includes(g.id)
  );

  return (
    <HomarrCardWrapper className={className}>
      {menu}
      {heading}
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
              />
            ))}
          </Group>
        </div>
      )}
    </HomarrCardWrapper>
  );
};

const useDashDotInfo = () => {
  const { name: configName, config } = useConfigContext();
  return useQuery({
    queryKey: [
      'dashdot/info',
      {
        configName,
        url: config?.integrations.dashDot?.properties.url,
      },
    ],
    queryFn: () => fetchDashDotInfo(configName),
  });
};

const fetchDashDotInfo = async (configName: string | undefined) => {
  if (!configName) return {} as DashDotInfo;
  return (await (
    await axios.get('/api/modules/dashdot/info', { params: { configName } })
  ).data) as DashDotInfo;
};

export interface DashDotInfo {
  storage: {
    layout: { size: number }[];
  };
  network: {
    speedUp: number;
    speedDown: number;
  };
}

export const useDashDotTileStyles = createStyles(() => ({
  graphsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 10,
  },
  graphsWrapper: {
    [`& > *:nth-child(odd):last-child`]: {
      width: '100% !important',
      maxWidth: '100% !important',
    },
  },
}));
