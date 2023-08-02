import { Flex, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconClock } from '@tabler/icons-react';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';

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
    enableTimezone:{
      type: 'switch',
      defaultValue: false,
    },
    timezoneLocation:{
      type: 'location',
      defaultValue: {
        name: 'Paris',
        latitude: 48.85341,
        longitude: 2.3488,
      },
    }
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: DateTile,
});

export type IDateWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface DateTileProps {
  widget: IDateWidget;
}

function DateTile({ widget }: DateTileProps) {
  const date = useDateState(widget.properties.enableTimezone ? widget.properties.timezoneLocation : undefined);
  const formatString = widget.properties.display24HourFormat ? 'HH:mm' : 'h:mm A';
  const { width, ref } = useElementSize();

  return (
    <Flex ref={ref} display="flex" justify="space-around" align="center" h="100%" direction="column">
      <Text size="md">{widget.properties.enableTimezone ? widget.properties.timezoneLocation.name : 'Local time'}</Text>
      <Title>{dayjs(date).format(formatString)}</Title>
      {width > 200 && <Text size="lg">{dayjs(date).format('dddd, MMMM D')}</Text>}
    </Flex>
  );
}

/**
 * State which updates when the minute is changing
 * @returns current date updated every new minute
 */
const useDateState = (location?: {latitude: number, longitude: number}) => {
  //Gets a timezone from user input location. If location is undefined, then it means it's a local timezone so keep undefined
  const timezone = location ? api.timezone.at.useQuery(location).data : undefined;
  const [date, setDate] = useState(getNewDate(timezone));
  const setSafeInterval = useSetSafeInterval();
  const timeoutRef = useRef<NodeJS.Timeout>(); // reference for initial timeout until first minute change
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDate(getNewDate(timezone));
      // Starts intervall which update the date every minute
      setSafeInterval(() => {
        setDate(getNewDate(timezone));
      }, 1000 * 60);
    }, getMsUntilNextMinute());

    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  return date;
};

//Returns a local date if no inputs or returns date from input zone
const getNewDate = (timezone?: string) => {
  if (timezone) {
    //Get Date Time from region
    const timezoneDate = moment(new Date()).tz(timezone).format();
    //Remove mention of the UTC offset
    const dateTruncated = timezoneDate.slice(0, timezoneDate.length-6);
    return new Date(dateTruncated);
  }
  return new Date();
}

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
