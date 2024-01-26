import { Stack, Text, createStyles } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezones from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getLanguageByCode } from '~/tools/language';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezones);

const definition = defineWidget({
  id: 'date',
  icon: IconClock,
  options: {
    timezone: {
      type: 'select',
      data: () => Intl.supportedValuesOf('timeZone').map((value) => ({ value, label: value })),
      defaultValue: Intl.DateTimeFormat().resolvedOptions().timeZone,
      info: true,
      infoLink: "https://www.timeanddate.com/time/map/",
    },
    customTitle: {
      type: 'text',
      defaultValue: '',
    },
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
  const formatString = widget.properties.display24HourFormat ? 'HH:mm' : 'h:mm A';
  const { ref, width } = useElementSize();
  const { cx, classes } = useStyles();
  const { data: sessionData } = useSession();
  const [now, setDate] = useState(new Date());

  useEffect(() => {
    // Refresh the time every second
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const language = getLanguageByCode(sessionData?.user.language ?? 'en');
  dayjs.locale(language.locale);

  return (
    <Stack ref={ref} className={cx(classes.wrapper, 'dashboard-tile-clock-wrapper')}>
      {widget.properties.titleState !== 'none' &&
        (widget.properties.customTitle.length > 0 || widget.properties.titleState === 'both') && (
          <Text
            size={width < 150 ? 'sm' : 'lg'}
            className={cx(classes.extras, 'dashboard-tile-clock-city')}
          >
            {widget.properties.customTitle.length > 0 && widget.properties.customTitle}
            {widget.properties.titleState === 'both' &&
              dayjs(now).tz(widget.properties.timezone).format(' (z)')}
          </Text>
        )}
      <Text className={cx(classes.clock, 'dashboard-tile-clock-hour')}>
        {dayjs(now).tz(widget.properties.timezone).format(formatString)}
      </Text>
      {!widget.properties.dateFormat.includes('hide') && (
        <Text
          size={width < 150 ? 'sm' : 'lg'}
          pt="0.2rem"
          className={cx(classes.extras, 'dashboard-tile-clock-date')}
        >
          {dayjs(now).tz(widget.properties.timezone).format(widget.properties.dateFormat)}
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

export default definition;
