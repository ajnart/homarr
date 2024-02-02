import { Box, Group, Paper, RingProgress, Text } from '@mantine/core';
import { IconCpu } from '@tabler/icons-react';

const OpenMediaVaultCpu = ({ info, cpuTemp }: any) => {
  const loadData = [
    {
      label: 'Load Average (1min)',
      stats: info.loadAverage['1min'],
      progress: info.loadAverage['1min'],
      color: 'teal',
    },
    {
      label: 'Load Average (5min)',
      stats: info.loadAverage['5min'],
      progress: info.loadAverage['5min'],
      color: 'blue',
    },
    {
      label: 'Load Average (15min)',
      stats: info.loadAverage['15min'],
      progress: info.loadAverage['15min'],
      color: 'red',
    },
  ] as const;

  return (
    <Box m="0.4rem" p="0.2rem">
      <Group>
        <IconCpu size={40} />
        <Text fz="lg" tt="uppercase" fw={700} c="dimmed">
          CPU Utilization: {info.cpuUtilization.toFixed(2)}%
        </Text>
        <Text fz="lg" tt="uppercase" fw={700} c="dimmed">
          CPU Temp: {cpuTemp.cputemp}°C
        </Text>
        <Group>
          {loadData.map((load: any) => (
            <Paper withBorder radius="md" p="xs" key={load.label}>
              <Group>
                <RingProgress
                  size={80}
                  roundCaps
                  thickness={8}
                  sections={[{ value: load.progress, color: load.color }]}
                />
                <Box>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    {load.label}
                  </Text>
                  <Text fw={700} size="xl">
                    {load.stats}
                  </Text>
                </Box>
              </Group>
            </Paper>
          ))}
        </Group>
      </Group>
    </Box>
  );
};

export default OpenMediaVaultCpu;
