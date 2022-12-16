import { Group, Stack, Text } from '@mantine/core';
import { IconArrowNarrowDown, IconArrowNarrowUp } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { bytes } from '../../../../tools/bytesHelper';

interface DashDotCompactNetworkProps {
  info: DashDotInfo;
}

export interface DashDotInfo {
  storage: {
    layout: { size: number }[];
  };
  network: {
    speedUp: number;
    speedDown: number;
  };
}

export const DashDotCompactNetwork = ({ info }: DashDotCompactNetworkProps) => {
  const { t } = useTranslation('modules/dashdot');

  const upSpeed = bytes.toPerSecondString(info?.network?.speedUp);
  const downSpeed = bytes.toPerSecondString(info?.network?.speedDown);

  return (
    <Group noWrap align="start" position="apart" w="100%" maw="251px">
      <Text weight={500}>{t('card.graphs.network.label')}</Text>
      <Stack align="end" spacing={0}>
        <Group spacing={0}>
          <Text size="xs" color="dimmed" align="right">
            {upSpeed}
          </Text>
          <IconArrowNarrowUp size={16} stroke={1.5} />
        </Group>
        <Group spacing={0}>
          <Text size="xs" color="dimmed" align="right">
            {downSpeed}
          </Text>
          <IconArrowNarrowDown size={16} stroke={1.5} />
        </Group>
      </Stack>
    </Group>
  );
};
