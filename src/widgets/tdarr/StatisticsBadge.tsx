import { Badge, Divider, Group, HoverCard, MantineColor, Stack, Text } from '@mantine/core';
import { IconHeartbeat, IconTransform } from '@tabler/icons-react';
import { useColorScheme } from '~/hooks/use-colorscheme';
import { useTranslation } from 'next-i18next';

interface StatisticsBadgeProps {
  staged: number;
  total: number;
  failed: number;
  type: 'transcodes' | 'healthchecks';
}

export function StatisticsBadge(props: StatisticsBadgeProps) {
  const { staged, total, failed, type } = props;

  const { colorScheme } = useColorScheme();
  const { t } = useTranslation('modules/tdarr-queue');

  const label = t(`statisticsBadge.label.${type}`);
  const Icon = type === 'transcodes' ? IconTransform : IconHeartbeat;

  const badgeColor = colorScheme === 'light' ? 'gray' : 'dark';
  const badgeVariant = colorScheme === 'light' ? 'light' : 'filled';

  return (
    <HoverCard position="bottom" width={250} shadow="sm" openDelay={0} closeDelay={0}>
      <HoverCard.Target>
        <Badge color={badgeColor} size="lg" variant={badgeVariant}>
          <Group>
            <Icon size={14} />
            <Text size="xs" color={textColor('yellow', colorScheme)}>{staged}</Text>
            <Text size="xs" color={textColor('green', colorScheme)}>{total}</Text>
            <Text size="xs" color={textColor('red', colorScheme)}>{failed}</Text>
          </Group>
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack spacing="sm" align="center">
          <Group spacing="xs">
            <Icon size={18} />
            <Text size="sm">{label}</Text>
          </Group>
          <Divider style={{
            alignSelf: 'stretch',
          }} />
          <Group display="flex" w="100%">
            <Stack style={{ flex: 1 }} spacing={0} align="center">
              <Text size="xs" color={textColor('yellow', colorScheme)}>{staged}</Text>
              <Text size="xs">Staged</Text>
            </Stack>
            <Stack style={{ flex: 1 }} spacing={0} align="center">
              <Text size="xs" color={textColor('green', colorScheme)}>{total}</Text>
              <Text size="xs">Total</Text>
            </Stack>
            <Stack style={{ flex: 1 }} spacing={0} align="center">
              <Text size="xs" color={textColor('red', colorScheme)}>{failed}</Text>
              <Text size="xs">Failed</Text>
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