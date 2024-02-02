import { Box, Group, Paper, Progress, Text } from '@mantine/core';
import { IconBrain } from '@tabler/icons-react';

const OpenMediaVaultMemory = ({ info }: any) => {
  const totalMemoryGB: any = (info.memTotal / 1024 ** 3).toFixed(2);
  const freeMemoryGB: any = (info.memAvailable / 1024 ** 3).toFixed(2);
  const usedMemoryGB: any = ((info.memTotal - info.memAvailable) / 1024 ** 3).toFixed(2);
  const percentageUsed: any = ((usedMemoryGB / totalMemoryGB) * 100).toFixed(2);
  const percentageFree: any = (100 - percentageUsed).toFixed(2);

  return (
    <Box m="0.4rem" p="0.2rem">
      <Group>
        <IconBrain size={40} />
        <Text fz="lg" tt="uppercase" fw={700} c="dimmed">
          Total Memory: {totalMemoryGB}GB
        </Text>
      </Group>
      <Paper withBorder radius="md" p="xs">
        <Group>
          <Text fz="lg" fw={500}>
            Used: {usedMemoryGB}GB - {percentageUsed}%
          </Text>
          <Text fz="lg" fw={500}>
            Available: {freeMemoryGB}GB - {percentageFree}%
          </Text>
        </Group>
        <Progress value={percentageUsed} mt="md" size="lg" radius="xl" />
      </Paper>
    </Box>
  );
};

export default OpenMediaVaultMemory;
