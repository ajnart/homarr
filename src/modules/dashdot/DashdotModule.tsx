import { createStyles, Stack, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconCalendar as CalendarIcon } from '@tabler/icons';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';
import { IModule } from '../ModuleTypes';

const asModule = <T extends IModule>(t: T) => t;
export const DashdotModule = asModule({
  title: 'Dash.',
  icon: CalendarIcon,
  component: DashdotComponent,
  options: {
    cpuMultiView: {
      name: 'descriptor.settings.cpuMultiView.label',
      value: false,
    },
    storageMultiView: {
      name: 'descriptor.settings.storageMultiView.label',
      value: false,
    },
    useCompactView: {
      name: 'descriptor.settings.useCompactView.label',
      value: false,
    },
    graphs: {
      name: 'descriptor.settings.graphs.label',
      value: ['CPU', 'RAM', 'Storage', 'Network'],
      options: ['CPU', 'RAM', 'Storage', 'Network', 'GPU'],
    },
    url: {
      name: 'descriptor.settings.url.label',
      value: '',
    },
  },
  id: 'dashdot',
});

const useStyles = createStyles((theme, _params, getRef) => ({
  heading: {
    marginTop: 0,
    marginBottom: 10,
  },
  table: {
    display: 'table',
  },
  tableRow: {
    display: 'table-row',
  },
  tableLabel: {
    display: 'table-cell',
    paddingRight: 10,
  },
  tableValue: {
    display: 'table-cell',
    whiteSpace: 'pre-wrap',
    paddingBottom: 5,
  },
  graphsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 10,
  },
  iframe: {
    flex: '1 0 auto',
    maxWidth: '100%',
    height: '140px',
    borderRadius: theme.radius.lg,
    border: 'none',
    colorScheme: 'none',
  },
  graphTitle: {
    ref: getRef('graphTitle'),
    position: 'absolute',
    right: 0,
    opacity: 0,
    transition: 'opacity .1s ease-in-out',
    pointerEvents: 'none',
  },
  graphStack: {
    [`&:hover .${getRef('graphTitle')}`]: {
      opacity: 0.5,
    },
  },
}));

const bpsPrettyPrint = (bits?: number) =>
  !bits
    ? '-'
    : bits > 1000 * 1000 * 1000
    ? `${(bits / 1000 / 1000 / 1000).toFixed(1)} Gb/s`
    : bits > 1000 * 1000
    ? `${(bits / 1000 / 1000).toFixed(1)} Mb/s`
    : bits > 1000
    ? `${(bits / 1000).toFixed(1)} Kb/s`
    : `${bits.toFixed(1)} b/s`;

const bytePrettyPrint = (byte: number): string =>
  byte > 1024 * 1024 * 1024
    ? `${(byte / 1024 / 1024 / 1024).toFixed(1)} GiB`
    : byte > 1024 * 1024
    ? `${(byte / 1024 / 1024).toFixed(1)} MiB`
    : byte > 1024
    ? `${(byte / 1024).toFixed(1)} KiB`
    : `${byte.toFixed(1)} B`;

const useJson = (targetUrl: string, url: string) => {
  const [data, setData] = useState<any | undefined>();

  const doRequest = async () => {
    try {
      const resp = await axios.get('/api/modules/dashdot', { params: { url, base: targetUrl } });

      setData(resp.data);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  };

  useEffect(() => {
    if (targetUrl) {
      doRequest();
    }
  }, [targetUrl]);

  return data;
};

export function DashdotComponent() {
  const { config } = useConfig();
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const { colorScheme } = useMantineColorScheme();

  const dashConfig = config.modules?.[DashdotModule.id].options as typeof DashdotModule['options'];
  const isCompact = dashConfig?.useCompactView?.value ?? false;
  const dashdotService: serviceItem | undefined = config.services.filter(
    (service) => service.type === 'Dash.'
  )[0];
  const dashdotUrl = dashdotService?.url ?? dashConfig?.url?.value ?? '';
  const enabledGraphs = dashConfig?.graphs?.value ?? ['CPU', 'RAM', 'Storage', 'Network'];
  const cpuEnabled = enabledGraphs.includes('CPU');
  const storageEnabled = enabledGraphs.includes('Storage');
  const ramEnabled = enabledGraphs.includes('RAM');
  const networkEnabled = enabledGraphs.includes('Network');
  const gpuEnabled = enabledGraphs.includes('GPU');

  const info = useJson(dashdotUrl, '/info');
  const storageLoad = useJson(dashdotUrl, '/load/storage');

  const totalUsed =
    (storageLoad?.layout as any[])?.reduce((acc, curr) => (curr.load ?? 0) + acc, 0) ?? 0;
  const totalSize =
    (info?.storage?.layout as any[])?.reduce((acc, curr) => (curr.size ?? 0) + acc, 0) ?? 0;

  const { t } = useTranslation('modules/dashdot');

  const graphs = [
    {
      id: 'cpu',
      name: t('card.graphs.cpu.title'),
      enabled: cpuEnabled,
      params: {
        multiView: dashConfig?.cpuMultiView?.value ?? false,
      },
    },
    {
      id: 'storage',
      name: t('card.graphs.storage.title'),
      enabled: storageEnabled && !isCompact,
      params: {
        multiView: dashConfig?.storageMultiView?.value ?? false,
      },
    },
    {
      id: 'ram',
      name: t('card.graphs.memory.title'),
      enabled: ramEnabled,
    },
    {
      id: 'network',
      name: t('card.graphs.network.title'),
      enabled: networkEnabled,
      spanTwo: true,
    },
    {
      id: 'gpu',
      name: t('card.graphs.gpu.title'),
      enabled: gpuEnabled,
      spanTwo: true,
    },
  ].filter((g) => g.enabled);

  if (dashdotUrl === '') {
    return (
      <div>
        <h2 className={classes.heading}>{t('card.title')}</h2>
        <p>{t('card.errors.noService')}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={classes.heading}>{t('card.title')}</h2>

      {!info ? (
        <p>{t('card.errors.noInformation')}</p>
      ) : (
        <div className={classes.graphsContainer}>
          <div className={classes.table}>
            {storageEnabled && isCompact && (
              <div className={classes.tableRow}>
                <p className={classes.tableLabel}>{t('card.graphs.storage.label')}</p>
                <p className={classes.tableValue}>
                  {((100 * totalUsed) / (totalSize || 1)).toFixed(1)}%{'\n'}
                  {bytePrettyPrint(totalUsed)} / {bytePrettyPrint(totalSize)}
                </p>
              </div>
            )}
            {networkEnabled && (
              <div className={classes.tableRow}>
                <p className={classes.tableLabel}>{t('card.graphs.network.label')}</p>
                <p className={classes.tableValue}>
                  {bpsPrettyPrint(info?.network?.speedUp)} {t('card.graphs.network.metrics.upload')}
                  {'\n'}
                  {bpsPrettyPrint(info?.network?.speedDown)}
                  {t('card.graphs.network.metrics.download')}
                </p>
              </div>
            )}
          </div>

          {graphs.map((graph) => (
            <Stack
              className={classes.graphStack}
              style={
                isCompact
                  ? {
                      width: graph.spanTwo ? '100%' : 'calc(50% - 5px)',
                      position: 'relative',
                    }
                  : undefined
              }
            >
              <Title className={classes.graphTitle} order={4} mt={10} mr={25}>
                {graph.name}
              </Title>
              <iframe
                className={classes.iframe}
                key={graph.name}
                title={graph.name}
                src={`${dashdotUrl}?singleGraphMode=true&graph=${graph.id.toLowerCase()}&theme=${colorScheme}&surface=${(colorScheme ===
                'dark'
                  ? theme.colors.dark[7]
                  : theme.colors.gray[0]
                ).substring(1)}${isCompact ? '&gap=10' : '&gap=5'}&innerRadius=${theme.radius.lg}${
                  graph.params
                    ? `&${Object.entries(graph.params)
                        .map(([key, value]) => `${key}=${value.toString()}`)
                        .join('&')}`
                    : ''
                }`}
                allowTransparency
              />
            </Stack>
          ))}
        </div>
      )}
    </div>
  );
}
