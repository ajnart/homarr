import { Box, Flex, Group, Paper, ScrollArea, Text } from '@mantine/core';
import { IconInfoSquare } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import OpenMediaVaultCpu from './OpenMediaVaultCpu';
import OpenMediaVaultFileSystem from './OpenMediaVaultFileSystem';
import OpenMediaVaultMemory from './OpenMediaVaultMemory';

const definition = defineWidget({
  id: 'openmediavault',
  icon: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/openmediavault.png',
  options: {},
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 8,
    maxHeight: 5,
  },
  component: OpenMediaVaultWidgetTile,
});

export type IOpenMediaVaultWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface OpenMediaVaultWidgetProps {
  widget: IOpenMediaVaultWidget;
}
function OpenMediaVaultWidgetTile({ widget }: OpenMediaVaultWidgetProps) {
  const { t } = useTranslation('modules/openmediavault');
  const { isInitialLoading, data: auth } = useOpenmediavaultAuthQuery();
  const { data: info } = useOpenmediavaultInfoQuery();
  const { data: fileSystem } = useOpenmediavaultFileSystemQuery();
  const { data: cpuTemp } = useOpenmediavaultCpuTempQuery();

  if (isInitialLoading || !auth || !info || !fileSystem || !cpuTemp) {
    return <WidgetLoading />;
  }

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 60 / 60 / 24);
    const remainingHours = Math.floor((uptime % (days * 24 * 60 * 60)) / 60 / 60);
    return `${days} days & ${remainingHours} hours`;
  };

  return (
    <Flex h="100%" w="100%" direction="column">
      <ScrollArea>
        <Box m="0.4rem" p="0.2rem">
          <Group>
            <IconInfoSquare size={40} />
            <Text fz="lg" tt="uppercase" fw={700} c="dimmed">
              Uptime: {formatUptime(info.uptime)}
            </Text>
          </Group>
          <Paper withBorder radius="md" p="xs">
            <Text fz="lg" fw={500}>
              Available Updates: {info.availablePkgUpdates === 0 ? 'No' : 'Yes'}
            </Text>
            <Text fz="lg" fw={500}>
              Reboot Required: {info.rebootRequired ? 'Yes' : 'No'}
            </Text>
          </Paper>
        </Box>
        <OpenMediaVaultMemory info={info} />
        <OpenMediaVaultCpu info={info} cpuTemp={cpuTemp} />
        <OpenMediaVaultFileSystem fileSystem={fileSystem} />
      </ScrollArea>
    </Flex>
  );
}

export const useOpenmediavaultAuthQuery = () => {
  const { name: configName } = useConfigContext();
  return api.openmediavault.auth.useQuery({
    configName: configName!,
  });
};

export const useOpenmediavaultInfoQuery = () => {
  const { name: configName } = useConfigContext();
  return api.openmediavault.systemInfo.useQuery(
    {
      configName: configName!,
    },
    {
      staleTime: 1000 * 10,
    }
  );
};

export const useOpenmediavaultFileSystemQuery = () => {
  const { name: configName } = useConfigContext();
  return api.openmediavault.fileSystem.useQuery(
    {
      configName: configName!,
    },
    {
      staleTime: 1000 * 10,
    }
  );
};

export const useOpenmediavaultCpuTempQuery = () => {
  const { name: configName } = useConfigContext();
  return api.openmediavault.cpuTemp.useQuery(
    {
      configName: configName!,
    },
    {
      staleTime: 1000 * 10,
    }
  );
};

export default definition;
