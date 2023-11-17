import { Group, Stack, Text } from '@mantine/core';
import { IconArrowNarrowDown, IconArrowNarrowUp } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { bytes } from '~/tools/bytesHelper';
import { RouterOutputs } from '~/utils/api';

interface DashDotCompactNetworkProps {
  info: DashDotInfo;
}

export type DashDotInfo = RouterOutputs['dashDot']['info'];

export const DashDotCompactNetwork = ({ info }: DashDotCompactNetworkProps) => {
  const { t } = useTranslation('modules/dashdot');

  const upSpeed = bytes.toPerSecondString(info?.network?.speedUp);
  const downSpeed = bytes.toPerSecondString(info?.network?.speedDown);

  return (
    <Group wrap="nowrap" align="start" justify="apart" w="100%">
      <Text weight={500}>{t('card.graphs.network.label')}</Text>
      <Stack align="end" gap={0}>
        <Group gap={0}>
          <Text size="xs" c="dimmed" align="right">
            {upSpeed}
          </Text>
          <IconArrowNarrowUp size={16} stroke={1.5} />
        </Group>
        <Group gap={0}>
          <Text size="xs" c="dimmed" align="right">
            {downSpeed}
          </Text>
          <IconArrowNarrowDown size={16} stroke={1.5} />
        </Group>
      </Stack>
    </Group>
  );
};
