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
  const fullSetting = config.settings[`${DateModule.title}.full`];
  // Change date on minute change
  // Note: Using 10 000ms instead of 1000ms to chill a little :)
  useEffect(() => {
    setInterval(() => {
      setDate(new Date());
    }, 1000 * 60);
  }, []);

  const timeString = `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }`;
  const halfTimeString = `${hours < 10 ? `${hours % 12}` : hours % 12}:${
    minutes < 10 ? `0${minutes}` : minutes
  } ${hours < 12 ? 'AM' : 'PM'}`;
  const finalTimeString = fullSetting ? timeString : halfTimeString;
  return (
    <Group p="sm" direction="column">
      <Title>{finalTimeString}</Title>
      <Text size="xl">{dayjs(date).format('dddd, MMMM D')}</Text>
    </Group>
  );
}
