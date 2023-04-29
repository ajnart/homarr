import { Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { RouterOutputs, api } from '~/utils/api';
import { bytes } from '../../tools/bytesHelper';
import { percentage } from '../../tools/shared/math/percentage.tool';

interface DashDotCompactStorageProps {
  info: RouterOutputs['dashDot']['info'];
  url: string;
}

export const DashDotCompactStorage = ({ info, url }: DashDotCompactStorageProps) => {
  const { t } = useTranslation('modules/dashdot');
  const { data: storageLoad } = useDashDotStorage(url);

  const totalUsed = calculateTotalCount(storageLoad ?? []);
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
  calculateTotalCount(layout.map((x) => x[key] as number));

const calculateTotalCount = (items: number[]) => items.reduce((p: number, c) => p + c, 0);

interface CalculateTotalLayoutSizeProps<TLayoutItem> {
  layout: TLayoutItem[];
  key: keyof TLayoutItem;
}

const useDashDotStorage = (dashDotUrl: string) => api.dashDot.storage.useQuery({ url: dashDotUrl });
