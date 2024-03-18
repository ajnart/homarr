import { Center, Flex, Group, HoverCard, RingProgress, Text } from '@mantine/core';
import { IconCpu } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const HealthMonitoringCpu = ({ info, cpuTemp, fahrenheit }: any) => {
  const { t } = useTranslation('modules/health-monitoring');
  const toFahrenheit = (value: number) => {
    return Math.round(value * 1.8 + 32);
  };

  interface LoadDataItem {
    label: string;
    stats: number;
    progress: number;
    color: string;
  }

  const loadData = [
    {
      label: `${t('cpu.minute', { minute: 1 })}`,
      stats: info.loadAverage['1min'],
      progress: info.loadAverage['1min'],
      color: 'teal',
    },
    {
      label: `${t('cpu.minutes', { minutes: 5 })}`,
      stats: info.loadAverage['5min'],
      progress: info.loadAverage['5min'],
      color: 'blue',
    },
    {
      label: `${t('cpu.minutes', { minutes: 15 })}`,
      stats: info.loadAverage['15min'],
      progress: info.loadAverage['15min'],
      color: 'red',
    },
  ] as const;

  return (
    <Group position="center">
      <RingProgress
        roundCaps
        size={120}
        thickness={12}
        label={
          <Center style={{ flexDirection: 'column' }}>
            {info.cpuUtilization.toFixed(2)}%
            <HoverCard width={280} shadow="md" position="top" withinPortal>
              <HoverCard.Target>
                <IconCpu size={40} />
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text fz="lg" tt="uppercase" fw={700} c="dimmed" align="center">
                  {t('cpu.load')}
                </Text>
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  gap={{ base: 'sm', sm: 'lg' }}
                  justify={{ sm: 'center' }}
                >
                  {loadData.map((load: LoadDataItem) => (
                    <RingProgress
                      size={80}
                      roundCaps
                      thickness={8}
                      label={
                        <Text color={load.color} weight={700} align="center" size="xl">
                          {load.progress}
                        </Text>
                      }
                      sections={[{ value: load.progress, color: load.color, tooltip: load.label }]}
                    />
                  ))}
                </Flex>
              </HoverCard.Dropdown>
            </HoverCard>
          </Center>
        }
        sections={[
          {
            value: info.cpuUtilization.toFixed(2),
            color: info.cpuUtilization.toFixed(2) > 70 ? 'red' : 'green',
          },
        ]}
      />
      {cpuTemp && (
        <RingProgress
          roundCaps
          size={120}
          thickness={12}
          label={
            <Center
              style={{
                flexDirection: 'column',
              }}
            >
              {fahrenheit ? `${toFahrenheit(cpuTemp.cputemp)}°F` : `${cpuTemp.cputemp}°C`}
              <IconCpu size={40} />
            </Center>
          }
          sections={[
            {
              value: cpuTemp.cputemp,
              color: cpuTemp.cputemp < 60 ? 'green' : 'red',
            },
          ]}
        />
      )}
    </Group>
  );
};

export default HealthMonitoringCpu;
