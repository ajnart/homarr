import { Group, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Clock, Cloud } from 'tabler-icons-react';
import { IModule } from '../modules';

export const WeatherModule: IModule = {
  title: 'Weather',
  description: 'Look up the current weather in your location',
  icon: Cloud,
  component: WeatherComponent,
};

export default function WeatherComponent(props: any) {
  const [date, setDate] = useState(new Date());
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Change date on minute change
  // Note: Using 10 000ms instead of 1000ms to chill a little :)
  useEffect(() => {
    setInterval(() => {
      setDate(new Date());
    }, 10000);
  }, []);

  return (
    <Group p="sm" direction="column">
      <Title>
        {hours < 10 ? `0${hours}` : hours}:{minutes < 10 ? `0${minutes}` : minutes}
      </Title>
      <Text size="xl">
        {
          // Use dayjs to format the date
          // https://day.js.org/en/getting-started/installation/
          dayjs(date).format('dddd, MMMM D')
        }
      </Text>
    </Group>
  );
}
