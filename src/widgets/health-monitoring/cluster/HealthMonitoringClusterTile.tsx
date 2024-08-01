import { Accordion, Card, Center, Flex, Group, RingProgress, Stack, Text } from '@mantine/core';
import {
  IconBrain,
  IconCpu,
  IconCube,
  IconDatabase,
  IconDeviceLaptop,
  IconInfoSquare,
  IconServer,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ResourceData } from '~/widgets/health-monitoring/cluster/types';

import { formatUptime } from '../HealthMonitoringTile';
import { ResourceType } from './HealthMonitoringClusterResourceRow';

export const ClusterStatusTile = ({ data, properties }: { data: any; properties: any }) => {
  const { t } = useTranslation('modules/health-monitoring');

  const running = (total: number, current: ResourceData) => {
    return current.running ? total + 1 : total;
  };

  const activeNodes = data.nodes.reduce(running, 0);
  const activeVMs = data.vms.reduce(running, 0);
  const activeLXCs = data.lxcs.reduce(running, 0);
  const activeStorage = data.storage.reduce(running, 0);

  const usedMem = data.nodes.reduce(
    (sum: number, item: ResourceData) => (item.running ? item.mem + sum : sum),
    0
  );
  const maxMem = data.nodes.reduce(
    (sum: number, item: ResourceData) => (item.running ? item.maxMem + sum : sum),
    0
  );
  const maxCpu = data.nodes.reduce(
    (sum: number, item: ResourceData) => (item.running ? item.maxCpu + sum : sum),
    0
  );
  const usedCpu = data.nodes.reduce(
    (sum: number, item: ResourceData) => (item.running ? item.cpu * item.maxCpu + sum : sum),
    0
  );
  const uptime = data.nodes.reduce(
    (sum: number, { uptime }: ResourceData) => (sum > uptime ? sum : uptime),
    0
  );

  const cpuPercent = (usedCpu / maxCpu) * 100;
  const memPercent = (usedMem / maxMem) * 100;

  return (
    <Stack h="100%">
      <Card>
        <Group position="center">
          <IconInfoSquare size={40} />
          <Text fz="lg" tt="uppercase" fw={700} c="dimmed" align="center">
            {t('info.uptime')}:
            <br />
            {formatUptime(uptime)}
          </Text>
        </Group>
      </Card>
      <SummaryHeader cpu={cpuPercent} memory={memPercent} include={properties.summary} />
      <Accordion
        variant="contained"
        chevronPosition="right"
        defaultValue={properties.defaultViewState}
      >
        <ResourceType
          item={{
            data: data.nodes,
            icon: IconServer,
            title: t('cluster.accordion.title.nodes'),
            count: activeNodes,
            length: data.nodes.length,
            indicatorColorControl: properties.sectionIndicatorColor,
          }}
          id={'node'}
          include={properties.showNode}
          tableConfig={{ showCpu: true, showRam: true, showNode: false }}
        />
        <ResourceType
          item={{
            data: data.vms,
            icon: IconDeviceLaptop,
            title: t('cluster.accordion.title.vms'),
            count: activeVMs,
            length: data.vms.length,
            indicatorColorControl: properties.sectionIndicatorColor,
          }}
          id={'vm'}
          include={properties.showVM}
          tableConfig={{ showCpu: true, showRam: true, showNode: false }}
        />
        <ResourceType
          item={{
            data: data.lxcs,
            icon: IconCube,
            title: t('cluster.accordion.title.lxcs'),
            count: activeLXCs,
            length: data.lxcs.length,
            indicatorColorControl: properties.sectionIndicatorColor,
          }}
          id={'lxc'}
          include={properties.showLXCs}
          tableConfig={{ showCpu: true, showRam: true, showNode: false }}
        />
        <ResourceType
          item={{
            data: data.storage,
            icon: IconDatabase,
            title: t('cluster.accordion.title.storage'),
            count: activeStorage,
            length: data.storage.length,
            indicatorColorControl: properties.sectionIndicatorColor,
          }}
          id={'storage'}
          include={properties.showStorage}
          tableConfig={{ showCpu: false, showRam: false, showNode: true }}
        />
      </Accordion>
    </Stack>
  );
};

interface SummaryHeaderProps {
  cpu: number;
  memory: number;
  include: boolean;
}

const SummaryHeader = ({ cpu, memory, include }: SummaryHeaderProps) => {
  const { t } = useTranslation('modules/health-monitoring');
  if (!include) return null;

  return (
    <Center>
      <Group noWrap>
        <Flex direction="row">
          <RingProgress
            roundCaps
            size={60}
            thickness={6}
            label={
              <Center>
                <IconCpu />
              </Center>
            }
            sections={[{ value: cpu, color: cpu > 75 ? 'orange' : 'green' }]}
          />
          <Stack align="center" justify="center" spacing={0}>
            <Text weight={500}>{t('cluster.summary.cpu')}</Text>
            <Text>{cpu.toFixed(1)}%</Text>
          </Stack>
        </Flex>
        <Flex>
          <RingProgress
            roundCaps
            size={60}
            thickness={6}
            label={
              <Center>
                <IconBrain />
              </Center>
            }
            sections={[{ value: memory, color: memory > 75 ? 'orange' : 'green' }]}
          />
          <Stack align="center" justify="center" spacing={0}>
            <Text weight={500}>{t('cluster.summary.ram')}</Text>
            <Text>{memory.toFixed(1)}%</Text>
          </Stack>
        </Flex>
      </Group>
    </Center>
  );
};
