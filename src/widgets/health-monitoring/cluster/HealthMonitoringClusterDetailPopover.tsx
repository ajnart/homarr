import {
  Badge,
  Center,
  Divider,
  Flex,
  Group,
  List,
  RingProgress,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconBrain,
  IconClockHour3,
  IconCpu,
  IconCube,
  IconDatabase,
  IconDeviceLaptop,
  IconHeartBolt,
  IconNetwork,
  IconServer,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'react-i18next';
import { humanFileSize } from '~/tools/humanFileSize';
import { ResourceData } from '~/widgets/health-monitoring/cluster/types';

dayjs.extend(duration);

export const ResourceTypeEntryDetails = ({ entry }: { entry: ResourceData }) => {
  const { t } = useTranslation('modules/health-monitoring');
  return (
    <Stack spacing={0}>
      <Group noWrap align="start" position="apart">
        <Group noWrap align="center">
          <ResourceIcon entry={entry} size={35} />
          <Stack spacing={0}>
            <Text fw={700} size="md">
              {entry.name}
            </Text>
            <Text color={entry.running ? 'green' : 'yellow'}>{capitalize(entry.status)}</Text>
          </Stack>
        </Group>
        <Group align="end">
          {entry.type !== 'node' && (
            <Stack align="end" spacing={0}>
              <Text fw={200} size="sm">
                {t('cluster.popover.node')}
              </Text>
              <Text color="dimmed" size="xs">
                {entry.node}
              </Text>
            </Stack>
          )}
          {(entry.type === 'lxc' || entry.type === 'vm') && (
            <Stack align="end" spacing={0}>
              <Text fw={200} size="sm">
                {t('cluster.popover.vmid')}
              </Text>
              <Text color="dimmed" size="xs">
                {entry.vmId}
              </Text>
            </Stack>
          )}
          {entry.type === 'storage' && (
            <Stack align="end" spacing={0}>
              <Text fw={200} size="sm">
                {t('cluster.popover.plugin')}
              </Text>
              <Text color="dimmed" size="xs">
                {entry.storagePlugin}
              </Text>
            </Stack>
          )}
        </Group>
      </Group>
      <Divider mt={0} mb="xs" />
      {entry.type !== 'storage' && <ComputeResourceDetails entry={entry} />}
      {entry.type === 'storage' && <StorageResourceDetails entry={entry} />}
    </Stack>
  );
};

const ComputeResourceDetails = ({ entry }: { entry: ResourceData }) => {
  const { t } = useTranslation('modules/health-monitoring');
  return (
    <List>
      <List.Item icon={<IconCpu size={16} />}>
        {t('cluster.popover.cores', { maxCpu: entry.maxCpu })}
      </List.Item>
      <List.Item icon={<IconBrain size={16} />}>{displayMemoryText(entry)}</List.Item>
      <List.Item icon={<IconDatabase size={16} />}>{displayDiskText(entry)}</List.Item>
      <List.Item icon={<IconClockHour3 size={16} />}>
        {t('cluster.popover.uptime', { uptime: formatUptime(entry) })}
      </List.Item>
      {entry.haState && (
        <List.Item icon={<IconHeartBolt size={16} />}>
          {t('cluster.popover.ha', { haState: capitalize(entry.haState) })}
        </List.Item>
      )}
      <NetStats entry={entry} />
      <DiskStats entry={entry} />
    </List>
  );
};

const StorageResourceDetails = ({ entry }: { entry: ResourceData }) => {
  const storagePercent = entry.maxDisk ? (entry.disk / entry.maxDisk) * 100 : 0;
  return (
    <Stack spacing={0}>
      <Center>
        <RingProgress
          roundCaps
          size={100}
          thickness={10}
          label={<Text ta="center">{storagePercent.toFixed(1)}%</Text>}
          sections={[{ value: storagePercent, color: storagePercent > 75 ? 'orange' : 'green' }]}
        />
        <Group align="center" spacing={0}>
          <Text>{displayDiskText(entry, false)}</Text>
        </Group>
      </Center>
      <Flex gap="sm" mt={0} justify="end">
        <StorageType entry={entry} />
      </Flex>
    </Stack>
  );
};

const DiskStats = ({ entry }: { entry: ResourceData }) => {
  if (!entry.diskWrite || !entry.diskRead) {
    return null;
  }
  return (
    <List.Item icon={<IconDatabase size={16} />}>
      <Group spacing="sm">
        <Group spacing={0}>
          <Text>{humanFileSize(entry.diskWrite, false)}</Text>
          <IconArrowNarrowDown size={14} />
        </Group>
        <Group spacing={0}>
          <Text>{humanFileSize(entry.diskRead, false)}</Text>
          <IconArrowNarrowUp size={14} />
        </Group>
      </Group>
    </List.Item>
  );
};

const NetStats = ({ entry }: { entry: ResourceData }) => {
  if (!entry.netIn || !entry.netOut) {
    return null;
  }
  return (
    <List.Item icon={<IconNetwork size={16} />}>
      <Group spacing="sm">
        <Group spacing={0}>
          <Text>{humanFileSize(entry.netIn, false)}</Text>
          <IconArrowNarrowDown size={14} />
        </Group>
        <Group spacing={0}>
          <Text>{humanFileSize(entry.netOut, false)}</Text>
          <IconArrowNarrowUp size={14} />
        </Group>
      </Group>
    </List.Item>
  );
};

const StorageType = ({ entry }: { entry: ResourceData }) => {
  const { t } = useTranslation('modules/health-monitoring');
  if (entry.storageShared) {
    return <Badge color="blue">{t('cluster.popover.sharedStorage')}</Badge>;
  } else {
    return <Badge color="teal">{t('cluster.popover.localStorage')}</Badge>;
  }
};

const capitalize = (input: string) => {
  return input[0].toUpperCase() + input.slice(1);
};

const ResourceIcon = ({ entry, size }: { entry: ResourceData; size: number }) => {
  if (entry.type === 'node') {
    return <IconServer size={size} />;
  } else if (entry.type === 'qemu') {
    return <IconDeviceLaptop size={size} />;
  } else if (entry.type === 'storage') {
    return <IconDatabase size={size} />;
  } else {
    return <IconCube size={size} />;
  }
};

const displayMemoryText = (entry: ResourceData) => {
  const { t } = useTranslation('modules/health-monitoring');
  if (!entry.maxMem) {
    return t('cluster.popover.memSize', { maxMem: humanFileSize(0, false) });
  } else if (!entry.mem) {
    return t('cluster.popover.memSize', { maxMem: humanFileSize(entry.maxMem, false) });
  } else {
    return t('cluster.popover.memRatio', {
      usedMem: humanFileSize(entry.mem, false),
      maxMem: humanFileSize(entry.maxMem, false),
    });
  }
};

const displayDiskText = (entry: ResourceData, useTrans: boolean = true) => {
  const { t } = useTranslation('modules/health-monitoring');
  const maxDisk = !entry.maxDisk ? humanFileSize(0, false) : humanFileSize(entry.maxDisk, false);
  const disk = !entry.disk ? humanFileSize(0, false) : humanFileSize(entry.disk, false);

  if (!entry.maxDisk || !entry.disk) {
    return useTrans ? t('cluster.popover.diskSize', { maxDisk: maxDisk }) : maxDisk;
  } else {
    return useTrans
      ? t('cluster.popover.diskRatio', { usedDisk: disk, maxDisk: maxDisk })
      : disk + ' / ' + maxDisk;
  }
};

const formatUptime = (entry: ResourceData) => {
  const { t } = useTranslation('modules/health-monitoring');
  if (entry.uptime > 0) {
    return dayjs.duration(entry.uptime * 1000).humanize();
  }
  return t('cluster.popover.na');
};
