import { Group, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Clock } from 'tabler-icons-react';
import { useConfig } from '../../../tools/state';
import { IModule } from '../modules';

export const DateModule: IModule = {
  title: 'Date',
  description: 'Show the current time and date in a card',
  icon: Clock,
  component: DateComponent,
  options: {
    full: {
      name: 'Display full time (24-hour)',
      value: true,
    },
  },
};

export default function DateComponent(props: any) {
  const [date, setDate] = useState(new Date());
  const { config } = useConfig();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isFullTime =
    config.settings[`${DateModule.title}.full`] === undefined
      ? true
      : config.settings[`${DateModule.title}.full`];
  const formatString = isFullTime ? 'HH:mm' : 'h:mm a';
  // Change date on minute change
  // Note: Using 10 000ms instead of 1000ms to chill a little :)
  useEffect(() => {
    setInterval(() => {
      setDate(new Date());
    }, 1000 * 60);
  }, []);

  return (
    <Group p="sm" direction="column">
      <Title>{dayjs(date).format(formatString)}</Title>
      <Text size="xl">{dayjs(date).format('dddd, MMMM D')}</Text>
    </Group>
  );
}
