import { Card, Divider, Flex, Group, ScrollArea, Text } from '@mantine/core';
import {
  IconCloudDownload,
  IconHeartRateMonitor,
  IconInfoSquare,
  IconStatusChange,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import HealthMonitoringCpu from './HealthMonitoringCpu';
import HealthMonitoringFileSystem from './HealthMonitoringFileSystem';
import HealthMonitoringMemory from './HealthMonitoringMemory';

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
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 6,
    maxHeight: 6,
  },
  component: HealthMonitoringWidgetTile,
});

export type IHealthMonitoringWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface HealthMonitoringWidgetProps {
  widget: IHealthMonitoringWidget;
}
function HealthMonitoringWidgetTile({ widget }: HealthMonitoringWidgetProps) {
  const { t } = useTranslation('modules/health-monitoring');
  const { isInitialLoading, data } = useOpenmediavaultQuery();

  if (isInitialLoading || !data) {
    return <WidgetLoading />;
  }

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (60 * 60 * 24));
    const remainingHours = Math.floor((uptime % (60 * 60 * 24)) / 3600);
    return `${days} days, ${remainingHours} hours`;
  };

  return (
    <Flex h="100%" w="100%" direction="column">
      <ScrollArea>
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
          {widget?.properties.cpu && (
            <HealthMonitoringCpu
              info={data.systemInfo}
              cpuTemp={data.cpuTemp}
              fahrenheit={widget?.properties.fahrenheit}
            />
          )}
          {widget?.properties.memory && <HealthMonitoringMemory info={data.systemInfo} />}
        </Group>
        {widget?.properties.fileSystem && (
          <>
            <Divider my="sm" />
            <HealthMonitoringFileSystem fileSystem={data.fileSystem} />
          </>
        )}
      </ScrollArea>
    </Flex>
  );
}

export const ringColor = (percentage: number) => {
  if (percentage < 30) return 'green';
  else if (percentage < 60) return 'yellow';
  else if (percentage < 90) return 'orange';
  else return 'red';
};

export const useOpenmediavaultQuery = () => {
  const { name: configName } = useConfigContext();
  return api.openmediavault.fetchData.useQuery(
    {
      configName: configName!,
    },
    {
      staleTime: 1000 * 10,
    }
  );
};

export default definition;
