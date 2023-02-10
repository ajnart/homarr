import { Center, createStyles, Grid, Stack, Text, Title } from '@mantine/core';
import { IconUnlink } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../config/provider';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { DashDotInfo } from './DashDotCompactNetwork';
import { DashDotGraph } from './DashDotGraph';

const definition = defineWidget({
  id: 'dashdot',
  icon: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/dashdot.png',
  options: {
    url: {
      type: 'text',
      defaultValue: '',
    },
    usePercentages: {
      type: 'switch',
      defaultValue: false,
    },
    columns: {
      type: 'number',
      defaultValue: 2,
    },
    graphHeight: {
      type: 'number',
      defaultValue: 115,
    },
    graphsOrder: {
      type: 'draggable-list',
      defaultValue: [
        {
          key: 'storage',
          subValues: {
            enabled: true,
            compactView: true,
            span: 2,
            multiView: false,
          },
        },
        {
          key: 'network',
          subValues: {
            enabled: true,
            compactView: true,
            span: 2,
          },
        },
        {
          key: 'cpu',
          subValues: {
            enabled: true,
            multiView: false,
            span: 1,
          },
        },
        {
          key: 'ram',
          subValues: {
            enabled: true,
            span: 1,
          },
        },
        {
          key: 'gpu',
          subValues: {
            enabled: false,
            span: 1,
          },
        },
      ],
      items: {
        cpu: {
          enabled: {
            type: 'switch',
          },
          span: {
            type: 'number',
          },
          multiView: {
            type: 'switch',
          },
        },
        storage: {
          enabled: {
            type: 'switch',
          },
          span: {
            type: 'number',
          },
          compactView: {
            type: 'switch',
          },
          multiView: {
            type: 'switch',
          },
        },
        ram: {
          enabled: {
            type: 'switch',
          },
          span: {
            type: 'number',
          },
        },
        network: {
          enabled: {
            type: 'switch',
          },
          span: {
            type: 'number',
          },
          compactView: {
            type: 'switch',
          },
        },
        gpu: {
          enabled: {
            type: 'switch',
          },
          span: {
            type: 'number',
          },
        },
      },
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

  const { graphsOrder, usePercentages, columns, graphHeight } = widget.properties;

  return (
    <Stack spacing="xs">
      <Title order={3}>{t('card.title')}</Title>
      {!info && <p>{t('card.errors.noInformation')}</p>}
      {info && (
        <div className={classes.graphsContainer}>
          <Grid grow gutter="sm" w="100%" columns={columns}>
            {graphsOrder
              .filter((g) => g.subValues.enabled)
              .map((g) => (
                <Grid.Col span={Math.min(columns, g.subValues.span)}>
                  <DashDotGraph
                    dashDotUrl={dashDotUrl}
                    info={info}
                    graph={g.key as any}
                    graphHeight={graphHeight}
                    isCompact={g.subValues.compactView ?? false}
                    multiView={g.subValues.multiView ?? false}
                    usePercentages={usePercentages}
                  />
                </Grid.Col>
              ))}
          </Grid>
        </div>
      )}
    </Stack>
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

export const useDashDotTileStyles = createStyles((theme) => ({
  graphsContainer: {
    marginRight: theme.spacing.sm * -1, // fix because margin collapses weirdly
  },
}));

export default definition;
