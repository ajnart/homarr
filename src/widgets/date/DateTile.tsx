import { Stack, Text, createStyles } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezones from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useSetSafeInterval } from '~/hooks/useSetSafeInterval';
import { getLanguageByCode } from '~/tools/language';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { InferWidget } from '../widgets';

dayjs.extend(advancedFormat);
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

export type IDateWidget = InferWidget<typeof definition>;

interface DateTileProps {
  widget: IDateWidget;
}

function DateTile({ widget }: DateTileProps) {
  const date = useDateState(
    widget.options.enableTimezone ? widget.options.timezoneLocation : undefined
  );
  const formatString = widget.options.display24HourFormat ? 'HH:mm' : 'h:mm A';
  const { ref, width } = useElementSize();
  const { cx, classes } = useStyles();
  const { data: sessionData } = useSession();

  const language = getLanguageByCode(sessionData?.user.language ?? 'en');
  dayjs.locale(language.locale);

  return (
    <Stack ref={ref} className={cx(classes.wrapper, 'dashboard-tile-clock-wrapper')}>
      {widget.options.enableTimezone && widget.options.titleState !== 'none' && (
        <Text
          size={width < 150 ? 'sm' : 'lg'}
          className={cx(classes.extras, 'dashboard-tile-clock-city')}
        >
          {widget.options.timezoneLocation.name}
          {widget.options.titleState === 'both' && dayjs(date).format(' (z)')}
        </Text>
      )}
      <Text
        suppressHydrationWarning={true}
        className={cx(classes.clock, 'dashboard-tile-clock-hour')}
      >
        {dayjs(date).format(formatString)}
      </Text>
      {!widget.options.dateFormat.includes('hide') && (
        <Text
          size={width < 150 ? 'sm' : 'lg'}
          pt="0.2rem"
          className={cx(classes.extras, 'dashboard-tile-clock-date')}
        >
          {dayjs(date).format(widget.options.dateFormat)}
        </Text>
      )}
    </Stack>
  );
}

const useStyles = createStyles(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: '100%',
    gap: 0,
  },
  clock: {
    lineHeight: '1',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    fontSize: '2.125rem',
  },
  extras: {
    lineHeight: '1',
    whiteSpace: 'nowrap',
  },
}));

/**
 * State which updates when the minute is changing
 * @returns current date updated every new minute
 */
const useDateState = (location?: { latitude: number; longitude: number }) => {
  //Gets a timezone from user input location. If location is undefined, then it means it's a local timezone so keep undefined
  const { data: timezone } = api.timezone.at.useQuery(location!, {
    enabled: location !== undefined,
  });
  const { data: sessionData } = useSession();
  const { data: userWithSettings } = api.user.withSettings.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });
  const userLanguage = userWithSettings?.settings.language;
  const [date, setDate] = useState(getNewDate(timezone));
  const setSafeInterval = useSetSafeInterval();
  const timeoutRef = useRef<NodeJS.Timeout>(); // reference for initial timeout until first minute change
  useEffect(() => {
    const language = getLanguageByCode(userLanguage ?? 'en');
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
  }, [timezone, userLanguage]);

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
