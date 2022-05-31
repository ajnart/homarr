import {
  Card,
  Center,
  ColorSwatch,
  Group,
  RingProgress,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { Cpu } from 'tabler-icons-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import si from 'systeminformation';
import { ResponsiveLine } from '@nivo/line';
import { IModule } from '../modules';
import { useListState } from '@mantine/hooks';

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

  // Refresh data every second
  useEffect(() => {
    setInterval(() => {
      axios.get('/api/modules/systeminfo').then((res) => setData(res.data));
    }, 1000);
  }, [args]);

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
        {/* <ResponsiveLine
          isInteractive
          enableSlices="x"
          sliceTooltip={({ slice }) => {
            const Download = slice.points[0].data.y as number;
            const Upload = slice.points[1].data.y as number;
            // Get the number of seconds since the last update.
            const seconds = (Date.now() - (slice.points[0].data.x as number)) / 1000;
            // Round to the nearest second.
            const roundedSeconds = Math.round(seconds);
            return (
              <Card p="sm" radius="md" withBorder>
                <Text size="md">{roundedSeconds} seconds ago</Text>
                <Card.Section p="sm">
                  <Group direction="column">
                    <Group>
                      <ColorSwatch size={10} color={theme.colors.green[5]} />
                      <Text size="md">CPU: {currentLoad}</Text>
                    </Group>
                  </Group>
                </Card.Section>
              </Card>
            );
          }}
          data={[
            {
              id: 'downloads',
              data: chartDataUp,
            },
          ]}
          curve="monotoneX"
          yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          enablePoints={false}
          animate={false}
          enableGridX={false}
          enableGridY={false}
          enableArea
          defs={[
            linearGradientDef('gradientA', [
              { offset: 0, color: 'inherit' },
              { offset: 100, color: 'inherit', opacity: 0 },
            ]),
          ]}
          fill={[{ match: '*', id: 'gradientA' }]}
          colors={[
            // Blue
            theme.colors.blue[5],
            // Green
            theme.colors.green[5],
          ]}
        /> */}
        <RingProgress
          size={120}
          label={<Center>{`${(currentLoad * 100).toFixed(2)}%`}</Center>}
          thickness={12}
          roundCaps
          sections={[{ value: data?.load?.currentLoad ?? 0, color: 'cyan' }]}
        />
      </Group>
    </Center>
  );
}
