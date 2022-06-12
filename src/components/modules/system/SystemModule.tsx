import { Center, Group, RingProgress, Title, useMantineTheme } from '@mantine/core';
import { IconCpu } from '@tabler/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import si from 'systeminformation';
import { useListState } from '@mantine/hooks';
import { IModule } from '../modules';
import { useSetSafeInterval } from '../../../tools/hooks/useSetSafeInterval';

export const SystemModule: IModule = {
  title: 'System info',
  description: 'Show the current CPU usage and memory usage',
  icon: IconCpu,
  component: SystemInfo,
};

interface ApiResponse {
  cpu: si.Systeminformation.CpuData;
  os: si.Systeminformation.OsData;
  memory: si.Systeminformation.MemData;
  load: si.Systeminformation.CurrentLoadData;
}

export default function SystemInfo(args: any) {
  const [data, setData] = useState<ApiResponse>();
  const setSafeInterval = useSetSafeInterval();
  // Refresh data every second
  useEffect(() => {
    setSafeInterval(() => {
      axios.get('/api/modules/systeminfo').then((res) => setData(res.data));
    }, 1000);
  }, []);

  // Update data every time data changes
  const [cpuLoadHistory, cpuLoadHistoryHandlers] =
    useListState<si.Systeminformation.CurrentLoadData>([]);

  // useEffect(() => {

  // }, [data]);

  const theme = useMantineTheme();
  const currentLoad = data?.load?.currentLoad ?? 0;

  return (
    <Center>
      <Group p="sm" direction="column" align="center">
        <Title order={3}>Current CPU load</Title>
        <RingProgress
          size={150}
          label={<Center>{`${currentLoad.toFixed(2)}%`}</Center>}
          thickness={15}
          roundCaps
          sections={[{ value: currentLoad ?? 0, color: 'cyan' }]}
        />
      </Group>
    </Center>
  );
}
