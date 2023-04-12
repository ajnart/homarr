import { Group } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconCalendarTime } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { i18n } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../config/provider';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { CalendarDay } from './CalendarDay';
import { MediasType } from './type';

const definition = defineWidget({
  id: 'calendar',
  icon: IconCalendarTime,
  options: {
    useSonarrv4: {
      type: 'switch',
      defaultValue: false,
    },
    sundayStart: {
      type: 'switch',
      defaultValue: false,
    },
    radarrReleaseType: {
      type: 'select',
      defaultValue: 'inCinemas',
      data: [
        { label: 'In Cinemas', value: 'inCinemas' },
        { label: 'Physical', value: 'physicalRelease' },
        { label: 'Digital', value: 'digitalRelease' },
      ],
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: CalendarTile,
});

export type ICalendarWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface CalendarTileProps {
  widget: ICalendarWidget;
}

function CalendarTile({ widget }: CalendarTileProps) {
  const { name: configName } = useConfigContext();
  const [month, setMonth] = useState(new Date());

  const { data: medias } = useQuery({
    queryKey: ['calendar/medias', { month: month.getMonth(), year: month.getFullYear() }],
    staleTime: 1000 * 60 * 60 * 5,
    queryFn: async () =>
      (await (
        await fetch(
          `/api/modules/calendar?year=${month.getFullYear()}&month=${
            month.getMonth() + 1
          }&configName=${configName}&widgetId=${widget.id}`
        )
      ).json()) as MediasType,
  });

  return (
    <Group grow style={{ height: '100%' }}>
      <Calendar
        defaultDate={new Date()}
        onPreviousMonth={setMonth}
        onNextMonth={setMonth}
        size="xs"
        locale={i18n?.resolvedLanguage ?? 'en'}
        firstDayOfWeek={widget.properties.sundayStart ? 0 : 1}
        hideWeekdays
        date={month}
        hasNextLevel={false}
        styles={{
          calendar: {
            height: '100%',
          },
          monthLevelGroup: {
            height: '100%',
          },
          monthLevel: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          },
          month: {
            flex: 1,
          },
          calendarHeader: {
            maxWidth: 'inherit',
          },
        }}
        renderDay={(date) => (
          <CalendarDay date={date} medias={getReleasedMediasForDate(medias, date, widget)} />
        )}
      />
    </Group>
  );
}

const getReleasedMediasForDate = (
  medias: MediasType | undefined,
  date: Date,
  widget: ICalendarWidget
): MediasType => {
  const { radarrReleaseType } = widget.properties;

  const books =
    medias?.books.filter((b) => new Date(b.releaseDate).toDateString() === date.toDateString()) ??
    [];
  const movies =
    medias?.movies.filter(
      (m) => new Date(m[radarrReleaseType]).toDateString() === date.toDateString()
    ) ?? [];
  const musics =
    medias?.musics.filter((m) => new Date(m.releaseDate).toDateString() === date.toDateString()) ??
    [];
  const tvShows =
    medias?.tvShows.filter(
      (tv) => new Date(tv.airDateUtc).toDateString() === date.toDateString()
    ) ?? [];
  const totalCount = medias ? books.length + movies.length + musics.length + tvShows.length : 0;

  return {
    books,
    movies,
    musics,
    tvShows,
    totalCount,
  };
};

export default definition;
