import { Box, Group, Paper, Progress, Text } from '@mantine/core';
import { IconServer } from '@tabler/icons-react';

const OpenMediaVaultFileSystem = ({ fileSystem }: any) => {
  function formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    const i = Math.floor(Math.log2(bytes) / 10);
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
  }

  return (
    <Box m="0.4rem" p="0.2rem">
      <Group>
        <IconServer size={40} />
        <Text fz="lg" tt="uppercase" fw={700} c="dimmed">
          Disks
        </Text>
      </Group>
      <Group>
        {fileSystem.map((disk: any) => (
          <Paper withBorder radius="md" p="xs" key={disk.devicename}>
            <Group>
              <Text fz="lg" tt="uppercase" fw={700} c="dimmed">
                {disk.devicename}
              </Text>
            </Group>
            <Group>
              <Text fz="lg" fw={500}>
                Used: {disk.used} - {disk.percentage}%
              </Text>
              <Text fz="lg" fw={500}>
                Available: {formatBytes(disk.available)} - {100 - disk.percentage}%
              </Text>
            </Group>
            <Progress value={disk.percentage} mt="md" size="lg" radius="xl" />
          </Paper>
        ))}
      </Group>
    </Box>
  );
};

export default OpenMediaVaultFileSystem;
