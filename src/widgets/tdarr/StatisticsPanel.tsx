import {
  Box,
  Center,
  Grid,
  Group,
  MantineColor,
  RingProgress,
  RingProgressProps,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconDatabaseHeart,
  IconFileDescription,
  IconHeartbeat,
  IconTransform,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { TdarrPieSegment, TdarrStatistics } from '~/server/api/routers/tdarr';
import { humanFileSize } from '~/tools/humanFileSize';
import { WidgetLoading } from '~/widgets/loading';

const PIE_COLORS: MantineColor[] = ['cyan', 'grape', 'gray', 'orange', 'pink'];

interface StatisticsPanelProps {
  statistics: TdarrStatistics | undefined;
  isLoading: boolean;
}

export function StatisticsPanel(props: StatisticsPanelProps) {
  const { statistics, isLoading } = props;

  const { t } = useTranslation('modules/tdarr-queue');

  if (isLoading) {
    return (
      <Stack
        justify="center"
        style={{
          flex: 1,
        }}
      >
        <WidgetLoading />
      </Stack>
    );
  }

  const allLibs = statistics?.pies.find((pie) => pie.libraryName === 'All');

  if (!statistics || !allLibs) {
    return (
      <Center
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1' }}
      >
        <Title order={3}>{t('views.statistics.empty')}</Title>
      </Center>
    );
  }

  return (
    <Stack style={{ flex: '1' }}>
      <Group
        style={{
          flex: 1,
        }}
        position="apart"
        align="center"
        noWrap
      >
        <Stack align="center" spacing={0}>
          <RingProgress size={120} sections={allLibs.transcodeStatus.map(toRingProgressSection)} />
          <Text size="xs">{t('views.statistics.pies.transcodes')}</Text>
        </Stack>
        <Grid gutter="xs">
          <Grid.Col span={6}>
            <StatBox
              icon={<IconTransform size={18} />}
              label={t('views.statistics.box.transcodes')}
              value={statistics.totalTranscodeCount}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <StatBox
              icon={<IconHeartbeat size={18} />}
              label={t('views.statistics.box.healthChecks')}
              value={statistics.totalHealthCheckCount}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <StatBox
              icon={<IconFileDescription size={18} />}
              label={t('views.statistics.box.files')}
              value={statistics.totalFileCount}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <StatBox
              icon={<IconDatabaseHeart size={18} />}
              label={t('views.statistics.box.spaceSaved')}
              value={allLibs?.savedSpace ? humanFileSize(allLibs.savedSpace) : '-'}
            />
          </Grid.Col>
        </Grid>
        <Stack align="center" spacing={0}>
          <RingProgress
            size={120}
            sections={allLibs.healthCheckStatus.map(toRingProgressSection)}
          />
          <Text size="xs">{t('views.statistics.pies.healthChecks')}</Text>
        </Stack>
      </Group>
      <Group
        style={{
          flex: 1,
        }}
        position="apart"
        align="center"
        noWrap
      >
        <Stack align="center" spacing={0}>
          <RingProgress size={120} sections={allLibs.videoCodecs.map(toRingProgressSection)} />
          <Text size="xs">{t('views.statistics.pies.videoCodecs')}</Text>
        </Stack>
        <Stack align="center" spacing={0}>
          <RingProgress size={120} sections={allLibs.videoContainers.map(toRingProgressSection)} />
          <Text size="xs">{t('views.statistics.pies.videoContainers')}</Text>
        </Stack>
        <Stack align="center" spacing={0}>
          <RingProgress size={120} sections={allLibs.videoResolutions.map(toRingProgressSection)} />
          <Text size="xs">{t('views.statistics.pies.videoResolutions')}</Text>
        </Stack>
      </Group>
    </Stack>
  );
}

function toRingProgressSection(
  segment: TdarrPieSegment,
  index: number
): RingProgressProps['sections'][number] {
  return {
    value: segment.value,
    tooltip: `${segment.name}: ${segment.value}`,
    color: PIE_COLORS[index % PIE_COLORS.length], // Ensures a valid color in the case that index > PIE_COLORS.length
  };
}

type StatBoxProps = {
  icon: ReactNode;
  label: string;
  value: number | string;
};

function StatBox(props: StatBoxProps) {
  const { icon, label, value } = props;
  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing.xs,
        border: '1px solid',
        borderRadius: theme.radius.md,
        borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[1],
      })}
    >
      <Stack spacing="xs" align="center">
        {icon}
        <Text size="xs">
          {label} {value}
        </Text>
      </Stack>
    </Box>
  );
}
