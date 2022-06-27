import { createStyles, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconCalendar as CalendarIcon } from '@tabler/icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useConfig } from '../../../tools/state';
import { serviceItem } from '../../../tools/types';
import { IModule } from '../modules';

const asModule = <T extends IModule>(t: T) => t;
export const DashdotModule = asModule({
  title: 'Dash.',
  description: 'A module for displaying the graphs of your running Dash. instance.',
  icon: CalendarIcon,
  component: DashdotComponent,
  options: {
    cpuMultiView: {
      name: 'CPU Multi-Core View',
      value: false,
    },
    storageMultiView: {
      name: 'Storage Multi-Drive View',
      value: false,
    },
    useCompactView: {
      name: 'Use Compact View',
      value: false,
    },
    showCpu: {
      name: 'Show CPU Graph',
      value: true,
    },
    showStorage: {
      name: 'Show Storage Graph',
      value: true,
    },
    showRam: {
      name: 'Show RAM Graph',
      value: true,
    },
    showNetwork: {
      name: 'Show Network Graphs',
      value: true,
    },
    showGpu: {
      name: 'Show GPU Graph',
      value: false,
    },
  },
});

const useStyles = createStyles((theme, _params) => ({
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
    rowGap: 15,
    columnGap: 10,
  },
  iframe: {
    flex: '1 0 auto',
    maxWidth: '100%',
    height: '140px',
    borderRadius: theme.radius.lg,
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

const useJson = (service: serviceItem | undefined, url: string) => {
  const [data, setData] = useState<any | undefined>();

  const doRequest = async () => {
    try {
      const resp = await axios.get(url, { baseURL: service?.url });

      setData(resp.data);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  };

  useEffect(() => {
    if (service?.url) {
      doRequest();
    }
  }, [service?.url]);

  return data;
};

export function DashdotComponent() {
  const { config } = useConfig();
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const { colorScheme } = useMantineColorScheme();

  const dashConfig = config.modules?.[DashdotModule.title]
    .options as typeof DashdotModule['options'];
  const isCompact = dashConfig?.useCompactView?.value ?? false;
  const dashdotService = config.services.filter((service) => service.type === 'Dash.')[0];

  const cpuEnabled = dashConfig?.showCpu?.value ?? true;
  const storageEnabled = dashConfig?.showStorage?.value ?? true;
  const ramEnabled = dashConfig?.showRam?.value ?? true;
  const networkEnabled = dashConfig?.showNetwork?.value ?? true;
  const gpuEnabled = dashConfig?.showGpu?.value ?? false;

  const info = useJson(dashdotService, '/info');
  const storageLoad = useJson(dashdotService, '/load/storage');

  const totalUsed =
    (storageLoad?.layout as any[])?.reduce((acc, curr) => (curr.load ?? 0) + acc, 0) ?? 0;
  const totalSize =
    (info?.storage?.layout as any[])?.reduce((acc, curr) => (curr.size ?? 0) + acc, 0) ?? 0;

  const graphs = [
    {
      name: 'CPU',
      enabled: cpuEnabled,
      params: {
        multiView: dashConfig?.cpuMultiView?.value ?? false,
      },
    },
    {
      name: 'Storage',
      enabled: storageEnabled && !isCompact,
      params: {
        multiView: dashConfig?.storageMultiView?.value ?? false,
      },
    },
    {
      name: 'RAM',
      enabled: ramEnabled,
    },
    {
      name: 'Network',
      enabled: networkEnabled,
      spanTwo: true,
    },
    {
      name: 'GPU',
      enabled: gpuEnabled,
      spanTwo: true,
    },
  ].filter((g) => g.enabled);

  return (
    <div>
      <h2 className={classes.heading}>Dash.</h2>

      {!dashdotService ? (
        <p>No dash. service found. Please add one to your Homarr dashboard.</p>
      ) : !info ? (
        <p>Cannot acquire information from dash. - are you running the latest version?</p>
      ) : (
        <div className={classes.graphsContainer}>
          <div className={classes.table}>
            {storageEnabled && isCompact && (
              <div className={classes.tableRow}>
                <p className={classes.tableLabel}>Storage:</p>
                <p className={classes.tableValue}>
                  {(totalUsed / (totalSize || 1)).toFixed(1)}%{'\n'}
                  {bytePrettyPrint(totalUsed)} / {bytePrettyPrint(totalSize)}
                </p>
              </div>
            )}

            <div className={classes.tableRow}>
              <p className={classes.tableLabel}>Network:</p>
              <p className={classes.tableValue}>
                {bpsPrettyPrint(info?.network?.speedUp)} Up{'\n'}
                {bpsPrettyPrint(info?.network?.speedDown)} Down
              </p>
            </div>
          </div>

          {graphs.map((graph) => (
            <iframe
              className={classes.iframe}
              style={
                isCompact
                  ? {
                      width: graph.spanTwo ? '100%' : 'calc(50% - 5px)',
                    }
                  : undefined
              }
              key={graph.name}
              title={graph.name}
              src={`${
                dashdotService.url
              }?singleGraphMode=true&graph=${graph.name.toLowerCase()}&theme=${colorScheme}&surface=${(colorScheme ===
              'dark'
                ? theme.colors.dark[7]
                : theme.colors.gray[0]
              ).substring(1)}${isCompact ? '&gap=1' : `&gap=5&innerRadius=${theme.radius.md}`}${
                graph.params
                  ? `&${Object.entries(graph.params)
                      .map(([key, value]) => `${key}=${value.toString()}`)
                      .join('&')}`
                  : ''
              }`}
              frameBorder="0"
              allowTransparency
            />
          ))}
        </div>
      )}
    </div>
  );
}
