import {
  ActionIcon,
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
import { TdarrStatistics } from '~/server/api/routers/tdarr';

interface StatisticsBadgeProps {
  statistics?: TdarrStatistics;
}

export function HealthCheckStatus(props: StatisticsBadgeProps) {
  const { statistics } = props;

  const { colorScheme } = useColorScheme();
  const { t } = useTranslation('modules/tdarr-queue');

  if (!statistics) {
    return (
      <ActionIcon loading>
        <IconHeartbeat size={20} />
      </ActionIcon>
    );
  }

  const indicatorColor = statistics.failedHealthCheckCount
    ? 'red'
    : statistics.stagedHealthCheckCount
      ? 'yellow'
      : 'green';

  return (
    <HoverCard position="bottom" width={250} shadow="sm" openDelay={0} closeDelay={0}>
      <HoverCard.Target>
        <ActionIcon
          variant="subtle"
          style={{
            cursor: 'initial',
          }}
        >
          <Indicator
            color={textColor(indicatorColor, colorScheme)}
            size={8}
            processing={!!statistics.stagedHealthCheckCount}
          >
            <IconHeartbeat size={20} />
          </Indicator>
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
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
