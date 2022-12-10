import { Group, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { bytes } from '../../../../tools/bytesHelper';
import { percentage } from '../../../../tools/percentage';
import { DashDotInfo } from './DashDotTile';

interface DashDotCompactStorageProps {
  info: DashDotInfo;
  dashDotUrl: string;
}

export const DashDotCompactStorage = ({ info, dashDotUrl }: DashDotCompactStorageProps) => {
  const { t } = useTranslation('modules/dashdot');
  const { data: storageLoad } = useQuery({
    queryKey: [
      'dashdot/storageLoad',
      {
        dashDotUrl,
      },
    ],
    queryFn: () => fetchDashDotStorageLoad(dashDotUrl),
  });

  const totalUsed = calculateTotalLayoutSize({
    layout: storageLoad?.layout ?? [],
    key: 'load',
  });
  const totalSize = calculateTotalLayoutSize({
    layout: info?.storage.layout ?? [],
    key: 'size',
  });

  return (
    <Group noWrap align="start" position="apart" w={'100%'} maw={'251px'}>
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
}: CalculateTotalLayoutSizeProps<TLayoutItem>) => {
  return layout.reduce((total, current) => {
    return total + (current[key] as number);
  }, 0);
};

interface CalculateTotalLayoutSizeProps<TLayoutItem> {
  layout: TLayoutItem[];
  key: keyof TLayoutItem;
}

const fetchDashDotStorageLoad = async (targetUrl: string) => {
  return (await (
    await axios.get('/api/modules/dashdot', { params: { url: '/load/storage', base: targetUrl } })
  ).data) as DashDotStorageLoad;
};

interface DashDotStorageLoad {
  layout: { load: number }[];
}
