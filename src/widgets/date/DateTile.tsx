import { Stack, Text, createStyles } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconClock } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { getLanguageByCode } from '~/tools/language';
import { api } from '~/utils/api';
import dayjs from 'dayjs';
import timezones from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { useSetSafeInterval } from '../../hooks/useSetSafeInterval';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

dayjs.extend(utc);
dayjs.extend(timezones);

const definition = defineWidget({
  id: 'date',
  icon: IconClock,
  options: {
    display24HourFormat: {
      type: 'switch',
      defaultValue: false,
    },
    dateFormat: {
      type: 'select',
      defaultValue: 'dddd, MMMM D',
      data: () => [
        { value: 'hide' },
        { value: 'dddd, MMMM D', label: dayjs().format('dddd, MMMM D') },
        { value: 'dddd, D MMMM', label: dayjs().format('dddd, D MMMM') },
        { value: 'MMM D', label: dayjs().format('MMM D') },
        { value: 'D MMM', label: dayjs().format('D MMM') },
        { value: 'DD/MM/YYYY', label: dayjs().format('DD/MM/YYYY') },
        { value: 'MM/DD/YYYY', label: dayjs().format('MM/DD/YYYY') },
        { value: 'DD/MM', label: dayjs().format('DD/MM') },
        { value: 'MM/DD', label: dayjs().format('MM/DD') },
      ],
    },
    enableTimezone: {
      type: 'switch',
      defaultValue: false,
    },
    timezoneLocation: {
      type: 'location',
      defaultValue: {
        name: 'Paris',
        latitude: 48.85341,
        longitude: 2.3488,
      },
    },
    titleState: {
      type: 'select',
      defaultValue: 'both',
      data: [{ value: 'both' }, { value: 'city' }, { value: 'none' }],
      info: true,
    },
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
  const date = useDateState(
    widget.properties.enableTimezone ? widget.properties.timezoneLocation : undefined
  );
  const formatString = widget.properties.display24HourFormat ? 'HH:mm' : 'h:mm A';
  const { ref, width } = useElementSize();
  const { cx, classes } = useStyles();

  return (
    <Stack ref={ref} className={cx(classes.wrapper, 'dashboard-tile-clock-wrapper')}>
      {widget.properties.enableTimezone && widget.properties.titleState !== 'none' && (
        <Text
          size={width < 150 ? 'sm' : 'lg'}
          className={cx(classes.extras, 'dashboard-tile-clock-city')}
        >
          {widget.properties.timezoneLocation.name}
          {widget.properties.titleState === 'both' && dayjs(date).format(' (z)')}
        </Text>
      )}
      <Text className={cx(classes.clock, 'dashboard-tile-clock-hour')}>
        {dayjs(date).format(formatString)}
      </Text>
      {!widget.properties.dateFormat.includes('hide') && (
        <Text
          size={width < 150 ? 'sm' : 'lg'}
          pt="0.2rem"
          className={cx(classes.extras, 'dashboard-tile-clock-date')}
        >
          {dayjs(date).format(widget.properties.dateFormat)}
        </Text>
      )}
    </Stack>
  );
}

const useStyles = createStyles(()=>({
  wrapper:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: '100%',
    gap: 0,
  },
  clock:{
    lineHeight: '1',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    fontSize: '2.125rem',
  },
  extras:{
    lineHeight: '1',
    whiteSpace: 'nowrap',
  }
}))

/**
 * State which updates when the minute is changing
 * @returns current date updated every new minute
 */
const useDateState = (location?: { latitude: number; longitude: number }) => {
  //Gets a timezone from user input location. If location is undefined, then it means it's a local timezone so keep undefined
  const { data: timezone } = api.timezone.at.useQuery(location!, {
    enabled: location !== undefined,
  });
  const { locale } = useRouter();
  const [date, setDate] = useState(getNewDate(timezone));
  const setSafeInterval = useSetSafeInterval();
  const timeoutRef = useRef<NodeJS.Timeout>(); // reference for initial timeout until first minute change
  useEffect(() => {
    const language = getLanguageByCode(locale ?? 'en');
    dayjs.locale(language.locale);
    setDate(getNewDate(timezone));
    timeoutRef.current = setTimeout(
      () => {
        setDate(getNewDate(timezone));
        // Starts interval which update the date every minute
        setSafeInterval(() => {
          setDate(getNewDate(timezone));
        }, 1000 * 60);
        //1 minute - current seconds and milliseconds count
      },
      1000 * 60 - (1000 * dayjs().second() + dayjs().millisecond())
    );
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [timezone, locale]);

  return date;
};

//Returns a local date if no inputs or returns date from input zone
const getNewDate = (timezone?: string) => {
  if (timezone) {
    return dayjs().tz(timezone);
  }
  return dayjs();
};

export default definition;
