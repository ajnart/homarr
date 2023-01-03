import { Center, Stack, Text, Title } from '@mantine/core';
import { IconClock } from '@tabler/icons';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useSetSafeInterval } from '../../hooks/useSetSafeInterval';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'date',
  icon: IconClock,
  options: {
    display24HourFormat: {
      type: 'switch',
      defaultValue: false,
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: DateTile,
});

export type IDateWidget = IWidget<typeof definition['id'], typeof definition>;

interface DateTileProps {
  widget: IDateWidget;
}

function DateTile({ widget }: DateTileProps) {
  const date = useDateState();
  const formatString = widget.properties.display24HourFormat ? 'HH:mm' : 'h:mm A';

  return (
    <Stack spacing="xs" justify="space-around" align="center" style={{ height: '100%' }}>
      <Title>{dayjs(date).format(formatString)}</Title>
      <Text size="lg">{dayjs(date).format('dddd, MMMM D')}</Text>
    </Stack>
  );
}

/**
 * State which updates when the minute is changing
 * @returns current date updated every new minute
 */
const useDateState = () => {
  const [date, setDate] = useState(new Date());
  const setSafeInterval = useSetSafeInterval();
  const timeoutRef = useRef<NodeJS.Timeout>(); // reference for initial timeout until first minute change
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDate(new Date());
      // Starts intervall which update the date every minute
      setSafeInterval(() => {
        setDate(new Date());
      }, 1000 * 60);
    }, getMsUntilNextMinute());

    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  return date;
};

// calculates the amount of milliseconds until next minute starts.
const getMsUntilNextMinute = () => {
  const now = new Date();
  const nextMinute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() + 1
  );
  return nextMinute.getTime() - now.getTime();
};

export default definition;
