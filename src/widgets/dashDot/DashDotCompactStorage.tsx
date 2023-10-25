import { Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { bytes } from '~/tools/bytesHelper';
import { percentage } from '~/tools/shared/math/percentage.tool';
import { api } from '~/utils/api';

import { DashDotInfo } from './DashDotCompactNetwork';

interface DashDotCompactStorageProps {
  info: DashDotInfo;
  url: string;
}

export const DashDotCompactStorage = ({ info, url }: DashDotCompactStorageProps) => {
  const { t } = useTranslation('modules/dashdot');
  const { data: storageLoad } = useDashDotStorage(url);

  const totalUsed = calculateTotalLayoutSize({
    layout: storageLoad ?? [],
  });
  const totalSize = calculateTotalLayoutSize({
    layout: info?.storage ?? [],
    key: 'size',
  });

  return (
    <Group noWrap align="start" position="apart" w="100%">
      <Text weight={500}>{t('card.graphs.storage.label')}</Text>
      <Stack align="end" spacing={0}>
        <Text color="dimmed" size="xs">
          {percentage(totalUsed, totalSize)}%
        </Text>
        <Text color="dimmed" size="xs">
          {bytes.toString(totalUsed)} / {bytes.toString(totalSize)}
        </Text>
      </Stack>
    </Group>
  );
};

const calculateTotalLayoutSize = <TLayoutItem,>({
  layout,
  key,
}: CalculateTotalLayoutSizeProps<TLayoutItem>) =>
  layout.reduce((total, current) => {
    if (key) {
      return total + (current[key] as number);
    }
    return total + (current as number);
  }, 0);

interface CalculateTotalLayoutSizeProps<TLayoutItem> {
  layout: TLayoutItem[];
  key?: keyof TLayoutItem;
}

const useDashDotStorage = (url: string) =>
  api.dashDot.storage.useQuery({
    url,
  });
