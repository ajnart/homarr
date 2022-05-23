import { Center, Group, RingProgress, Title } from '@mantine/core';
import { Cpu } from 'tabler-icons-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import si from 'systeminformation';
import { IModule } from '../modules';

export const SystemModule: IModule = {
  title: 'System info',
  description: 'Show the current CPU usage and memory usage',
  icon: Cpu,
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
  // Refresh data every 5 seconds
  useEffect(() => {
    axios.get('/api/modules/systeminfo').then((res) => setData(res.data));
    setInterval(() => {
      axios.get('/api/modules/systeminfo').then((res) => setData(res.data));
    }, 3 * 1000);
  }, []);

  return (
    <Center>
      <Group p="sm" direction="column" align="center">
        <Title order={3}>Current CPU load</Title>
        <RingProgress
          size={120}
          label={<Center>{`${data?.load?.currentLoad.toFixed(2)}%`}</Center>}
          thickness={12}
          roundCaps
          sections={[{ value: data?.load?.currentLoad ?? 0, color: 'cyan' }]}
        />
      </Group>
    </Center>
  );
}
