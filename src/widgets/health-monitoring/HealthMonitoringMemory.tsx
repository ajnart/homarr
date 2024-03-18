import { Center, Group, HoverCard, RingProgress, Text } from '@mantine/core';
import { IconBrain } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { ringColor } from './HealthMonitoringTile';

const HealthMonitoringMemory = ({ info }: any) => {
  const { t } = useTranslation('modules/health-monitoring');
  const totalMemoryGB: any = (info.memTotal / 1024 ** 3).toFixed(2);
  const freeMemoryGB: any = (info.memAvailable / 1024 ** 3).toFixed(2);
  const usedMemoryGB: any = ((info.memTotal - info.memAvailable) / 1024 ** 3).toFixed(2);
  const percentageUsed: any = ((usedMemoryGB / totalMemoryGB) * 100).toFixed(2);
  const percentageFree: any = (100 - percentageUsed).toFixed(2);

  return (
    <Group position="center">
      <RingProgress
        roundCaps
        size={120}
        thickness={12}
        label={
          <Center style={{ flexDirection: 'column' }}>
            {usedMemoryGB}GiB
            <HoverCard width={280} shadow="md" position="top" withinPortal>
              <HoverCard.Target>
                <IconBrain size={40} />
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text fz="lg" tt="uppercase" fw={700} c="dimmed" align="center">
                  {t('memory.totalMem', { total: totalMemoryGB })}
                </Text>
                <Text fz="lg" fw={500} align="center">
                  {t('memory.available', { available: freeMemoryGB, percentage: percentageFree })}
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          </Center>
        }
        sections={[
          {
            value: percentageUsed,
            color: ringColor(percentageUsed),
          },
        ]}
      />
    </Group>
  );
};

export default HealthMonitoringMemory;
