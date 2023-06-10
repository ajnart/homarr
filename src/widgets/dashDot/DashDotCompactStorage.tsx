import { Group, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../config/provider';
import { bytes } from '../../tools/bytesHelper';
import { percentage } from '../../tools/shared/math/percentage.tool';
import { DashDotInfo } from './DashDotCompactNetwork';

interface DashDotCompactStorageProps {
  info: DashDotInfo;
  widgetId: string;
}

export const DashDotCompactStorage = ({ info, widgetId }: DashDotCompactStorageProps) => {
  const { t } = useTranslation('modules/dashdot');
  const { data: storageLoad } = useDashDotStorage(widgetId);

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

const useDashDotStorage = (widgetId: string) => {
  const { name: configName, config } = useConfigContext();

  return useQuery({
    queryKey: [
      'dashdot/storage',
      {
        configName,
        url: config?.widgets.find((x) => x.type === 'dashdot')?.properties.url,
        widgetId,
      },
    ],
    queryFn: () => fetchDashDotStorageLoad(configName, widgetId),
  });
};

async function fetchDashDotStorageLoad(configName: string | undefined, widgetId: string) {
  if (!configName) throw new Error('configName is undefined');
  return (await (
    await axios.get('/api/modules/dashdot/storage', { params: { configName, widgetId } })
  ).data) as number[];
}
