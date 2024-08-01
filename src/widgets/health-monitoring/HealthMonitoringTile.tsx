import { Card, Center, Divider, Group, ScrollArea, Stack, Tabs, Text, Title } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCloudDownload,
  IconHeartRateMonitor,
  IconInfoSquare,
  IconStatusChange,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import HealthMonitoringCpu from './HealthMonitoringCpu';
import HealthMonitoringFileSystem from './HealthMonitoringFileSystem';
import HealthMonitoringMemory from './HealthMonitoringMemory';
import { ClusterStatusTile } from './cluster/HealthMonitoringClusterTile';

dayjs.extend(duration);

const defaultViewStates = ['none', 'node', 'vm', 'lxc', 'storage'] as const;
type DefaultViewState = (typeof defaultViewStates)[number];

const indicatorColorControls = ['all', 'any'] as const;
type IndicatorColorControl = (typeof indicatorColorControls)[number];

const defaultTabStates = ['system', 'cluster'] as const;
type DefaultTabStates = (typeof defaultTabStates)[number];

const definition = defineWidget({
  id: 'health-monitoring',
  icon: IconHeartRateMonitor,
  options: {
    fahrenheit: {
      type: 'switch',
      defaultValue: false,
    },
    cpu: {
      type: 'switch',
      defaultValue: true,
    },
    memory: {
      type: 'switch',
      defaultValue: true,
    },
    fileSystem: {
      type: 'switch',
      defaultValue: true,
    },
    defaultTabState: {
      type: 'select',
      defaultValue: 'system' as DefaultTabStates,
      data: defaultTabStates.map((stateValue) => ({ value: stateValue })),
      info: true,
    },
    node: {
      type: 'text',
      defaultValue: '',
      info: true,
    },
    defaultViewState: {
      type: 'select',
      defaultValue: 'none' as DefaultViewState,
      data: defaultViewStates.map((stateValue) => ({ value: stateValue })),
    },
    summary: {
      type: 'switch',
      defaultValue: true,
    },
    showNode: {
      type: 'switch',
      defaultValue: true,
    },
    showVM: {
      type: 'switch',
      defaultValue: true,
    },
    showLXCs: {
      type: 'switch',
      defaultValue: true,
    },
    showStorage: {
      type: 'switch',
      defaultValue: true,
    },
    sectionIndicatorColor: {
      type: 'select',
      defaultValue: 'all' as IndicatorColorControl,
      data: indicatorColorControls.map((sectionColor) => ({ value: sectionColor })),
      info: true,
    },
    ignoreCert: {
      type: 'switch',
      defaultValue: true,
      info: true,
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: HealthMonitoringWidgetTile,
});

export type IHealthMonitoringWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface HealthMonitoringWidgetProps {
  widget: IHealthMonitoringWidget;
}
function HealthMonitoringWidgetTile({ widget }: HealthMonitoringWidgetProps) {
  const { t } = useTranslation('modules/health-monitoring');
  let { data, isInitialLoading, isError } = useStatusQuery(
    widget.properties.node,
    widget.properties.ignoreCert
  );

  if (isInitialLoading) {
    return <WidgetLoading />;
  }

  if (isError || !data) {
    return (
      <Center>
        <Stack align="center">
          <IconAlertTriangle />
          <Title order={6}>{t('errors.general.title')}</Title>
          <Text>{t('errors.general.text')}</Text>
        </Stack>
      </Center>
    );
  }

  if (data.system && data.cluster) {
    return (
      <ScrollArea
        h="100%"
        styles={{
          viewport: {
            '& div[style="min-width: 100%"]': {
              display: 'flex !important',
              height: '100%',
            },
          },
        }}
      >
        <Tabs defaultValue={widget.properties.defaultTabState} variant="outline">
          <Tabs.List grow>
            <Tabs.Tab value="system">
              <b>{t('headings.system')}</b>
            </Tabs.Tab>
            <Tabs.Tab value="cluster">
              <b>{t('headings.cluster')}</b>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel mt="lg" value="system">
            <SystemStatusTile data={data.system} properties={widget.properties} />
          </Tabs.Panel>
          <Tabs.Panel mt="lg" value="cluster">
            <ClusterStatusTile data={data.cluster} properties={widget.properties} />
          </Tabs.Panel>
        </Tabs>
      </ScrollArea>
    );
  } else {
    return (
      <ScrollArea
        h="100%"
        styles={{
          viewport: {
            '& div[style="min-width: 100%"]': {
              display: 'flex !important',
              height: '100%',
            },
          },
        }}
      >
        {data.system && <SystemStatusTile data={data.system} properties={widget.properties} />}
        {data.cluster && <ClusterStatusTile data={data.cluster} properties={widget.properties} />}
      </ScrollArea>
    );
  }
}

const SystemStatusTile = ({ data, properties }: { data: any; properties: any }) => {
  const { t } = useTranslation('modules/health-monitoring');

  return (
    <Stack>
      <Card>
        <Group position="center">
          <IconInfoSquare size={40} />
          <Text fz="lg" tt="uppercase" fw={700} c="dimmed" align="center">
            {t('info.uptime')}:
            <br />
            {formatUptime(data.systemInfo.uptime)}
          </Text>
          <Group position="center">
            {data.systemInfo.availablePkgUpdates === 0 ? (
              ''
            ) : (
              <IconCloudDownload size={40} color="red" />
            )}
            {data.systemInfo.rebootRequired ? <IconStatusChange size={40} color="red" /> : ''}
          </Group>
        </Group>
      </Card>
      <Divider my="sm" />
      <Group position="center">
        {properties.cpu && (
          <HealthMonitoringCpu
            info={data.systemInfo}
            cpuTemp={data.cpuTemp}
            fahrenheit={properties.fahrenheit}
          />
        )}
        {properties.memory && <HealthMonitoringMemory info={data.systemInfo} />}
      </Group>
      {properties.fileSystem && (
        <>
          <Divider my="sm" />
          <HealthMonitoringFileSystem fileSystem={data.fileSystem} />
        </>
      )}
    </Stack>
  );
};

export const ringColor = (percentage: number) => {
  if (percentage < 30) return 'green';
  else if (percentage < 60) return 'yellow';
  else if (percentage < 90) return 'orange';
  else return 'red';
};

export const getIntegrations = () => {
  const { name: configName } = useConfigContext();
  return api.healthMonitoring.integrations.useQuery(
    {
      configName: configName!,
    },
    {
      staleTime: 1000 * 10,
    }
  );
};

const useStatusQuery = (node: string, ignoreCerts: boolean) => {
  const { name: configName } = useConfigContext();

  return api.healthMonitoring.fetchData.useQuery(
    {
      configName: configName!,
      filterNode: node!,
      ignoreCerts: ignoreCerts!,
    },
    {
      refetchInterval: 5000,
    }
  );
};

export default definition;

export const formatUptime = (uptime: number) => {
  const { t } = useTranslation('modules/health-monitoring');
  const time = dayjs.duration(uptime, 's');
  return t('info.uptimeFormat', {
    days: Math.floor(time.asDays()),
    hours: time.hours(),
    minutes: time.minutes(),
  });
};
