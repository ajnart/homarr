import { Group, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { IconClock as Clock } from '@tabler/icons';
import { useConfig } from '../../tools/state';
import { IModule } from '../ModuleTypes';
import { useSetSafeInterval } from '../../tools/hooks/useSetSafeInterval';

export const DateModule: IModule = {
  title: 'Date',
  icon: Clock,
  component: DateComponent,
  options: {
    full: {
      name: 'descriptor.settings.display24HourFormat.label',
      value: true,
    },
  },
  id: 'date',
};

export default function DateComponent(props: any) {
  const [date, setDate] = useState(new Date());
  const setSafeInterval = useSetSafeInterval();
  const { config } = useConfig();
  const isFullTime = config?.modules?.[DateModule.id]?.options?.full?.value ?? true;
  const formatString = isFullTime ? 'HH:mm' : 'h:mm A';
  // Change date on minute change
  // Note: Using 10 000ms instead of 1000ms to chill a little :)
  useEffect(() => {
    setSafeInterval(() => {
      setDate(new Date());
    }, 1000 * 60);
  }, []);

  return (
    <Group p="sm" spacing="xs">
      <Title>{dayjs(date).format(formatString)}</Title>
      <Text size="lg">{dayjs(date).format('dddd, MMMM D')}</Text>
    </Group>
  );
}
