import { Group, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Clock } from 'tabler-icons-react';
import { IModule } from '../modules';

export const DateModule: IModule = {
  title: 'Date',
  description: 'Show the current time and date in a card',
  icon: Clock,
  component: DateComponent,
};

export default function DateComponent(props: any) {
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
    <Group direction="column">
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
