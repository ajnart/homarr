import {
  Divider,
  Group,
  HoverCard,
  Indicator,
  MantineColor,
  RingProgress,
  Stack,
  Text,
} from '@mantine/core';
import { IconHeartbeat } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useColorScheme } from '~/hooks/use-colorscheme';

import { TdarrStatistics } from '~/types/api/tdarr';

interface StatisticsBadgeProps {
  statistics?: TdarrStatistics;
}

export function HealthCheckStatus(props: StatisticsBadgeProps) {
  const { statistics } = props;

  const { colorScheme } = useColorScheme();
  const { t } = useTranslation('modules/media-transcoding');

  if (!statistics) {
    return <IconHeartbeat size={20} />;
  }

  const indicatorColor = statistics.failedHealthCheckCount
    ? 'red'
    : statistics.stagedHealthCheckCount
      ? 'yellow'
      : 'green';

  return (
    <HoverCard position="bottom" width={250} shadow="sm">
      <HoverCard.Target>
          <Indicator color={textColor(indicatorColor, colorScheme)} size={8} display="flex">
            <IconHeartbeat size={20} />
          </Indicator>
      </HoverCard.Target>
      <HoverCard.Dropdown bg={colorScheme === 'light' ? 'gray.2' : 'dark.8'}>
        <Stack spacing="sm" align="center">
          <Group spacing="xs">
            <IconHeartbeat size={18} />
            <Text size="sm">{t(`healthCheckStatus.title`)}</Text>
          </Group>
          <Divider
            style={{
              alignSelf: 'stretch',
            }}
          />
          <RingProgress
            sections={[
              { value: statistics.stagedHealthCheckCount, color: textColor('yellow', colorScheme) },
              { value: statistics.totalHealthCheckCount, color: textColor('green', colorScheme) },
              { value: statistics.failedHealthCheckCount, color: textColor('red', colorScheme) },
            ]}
          />
          <Group display="flex" w="100%">
            <Stack style={{ flex: 1 }} spacing={0} align="center">
              <Text size="xs" color={textColor('yellow', colorScheme)}>
                {statistics.stagedHealthCheckCount}
              </Text>
              <Text size="xs">{t(`healthCheckStatus.queued`)}</Text>
            </Stack>
            <Stack style={{ flex: 1 }} spacing={0} align="center">
              <Text size="xs" color={textColor('green', colorScheme)}>
                {statistics.totalHealthCheckCount}
              </Text>
              <Text size="xs">{t(`healthCheckStatus.healthy`)}</Text>
            </Stack>
            <Stack style={{ flex: 1 }} spacing={0} align="center">
              <Text size="xs" color={textColor('red', colorScheme)}>
                {statistics.failedHealthCheckCount}
              </Text>
              <Text size="xs">{t(`healthCheckStatus.unhealthy`)}</Text>
            </Stack>
          </Group>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

function textColor(color: MantineColor, theme: 'light' | 'dark') {
  return `${color}.${theme === 'light' ? 8 : 5}`;
}
