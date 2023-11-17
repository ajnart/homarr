import { useMantineTheme } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconCalendarTime } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRequiredBoard } from '~/components/Board/context';
import { useEditModeStore } from '~/components/Board/useEditModeStore';
import { getLanguageByCode } from '~/tools/language';
import { RouterOutputs, api } from '~/utils/api';

import { defineWidget } from '../helper';
import { InferWidget } from '../widgets';
import { CalendarDay } from './CalendarDay';
import { getBgColorByDateAndTheme } from './bg-calculator';
import { MediasType } from './type';

const definition = defineWidget({
  id: 'calendar',
  icon: IconCalendarTime,
  options: {
    hideWeekDays: {
      type: 'switch',
      defaultValue: true,
    },
    showUnmonitored: {
      type: 'switch',
      defaultValue: false,
    },
    radarrReleaseType: {
      type: 'select',
      defaultValue: 'inCinemas',
      data: [{ value: 'inCinemas' }, { value: 'physicalRelease' }, { value: 'digitalRelease' }],
    },
    fontSize: {
      type: 'select',
      defaultValue: 'xs',
      data: [{ value: 'xs' }, { value: 'sm' }, { value: 'md' }, { value: 'lg' }, { value: 'xl' }],
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

export type ICalendarWidget = InferWidget<typeof definition>;

interface CalendarTileProps {
  widget: ICalendarWidget;
}

function CalendarTile({ widget }: CalendarTileProps) {
  const { colorScheme, radius } = useMantineTheme();
  const { id: boardId } = useRequiredBoard();
  const [month, setMonth] = useState(new Date());
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { data: sessionData } = useSession();
  const { data: userWithSettings } = api.user.withSettings.useQuery(undefined, {
    enabled: !!sessionData?.user,
  });

  const language = getLanguageByCode(userWithSettings?.settings.language ?? 'en');

  const { data: medias } = api.calendar.medias.useQuery(
    {
      boardId,
      widgetId: widget.id,
      month: month.getMonth() + 1,
      year: month.getFullYear(),
      options: {
        showUnmonitored: widget.options.showUnmonitored,
      },
    },
    {
      staleTime: 1000 * 60 * 60 * 5,
      enabled: isEditMode === false,
    }
  );

  const firstDayOfWeek = userWithSettings?.settings.firstDayOfWeek ?? 'monday';

  return (
    <Calendar
      defaultDate={new Date()}
      onPreviousMonth={setMonth}
      onNextMonth={setMonth}
      size={widget.options.fontSize}
      locale={language.locale}
      firstDayOfWeek={getFirstDayOfWeek(firstDayOfWeek)}
      hideWeekdays={widget.options.hideWeekDays}
      style={{ position: 'relative' }}
      date={month}
      maxLevel="month"
      styles={{
        calendarHeader: {
          maxWidth: 'inherit',
          marginBottom: '0.35rem !important',
        },
        calendarHeaderLevel: {
          height: '100%',
        },
        calendarHeaderControl: {
          height: '100%',
        },
        calendar: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
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
        monthCell: {
          textAlign: 'center',
        },
        month: {
          flex: 1,
        },
        day: {
          borderRadius: ['xs', 'sm'].includes(widget.options.fontSize) ? radius.md : radius.lg,
        },
      }}
      getDayProps={(date) => ({
        bg: getBgColorByDateAndTheme(colorScheme, date),
      })}
      renderDay={(date) => (
        <CalendarDay
          date={date}
          medias={getReleasedMediasForDate(medias, date, widget)}
          size={widget.options.fontSize}
        />
      )}
    />
  );
}

const getFirstDayOfWeek = (
  firstDayOfWeek: RouterOutputs['user']['withSettings']['settings']['firstDayOfWeek']
) => {
  if (firstDayOfWeek === 'sunday') return 0;
  if (firstDayOfWeek === 'monday') return 1;
  return 6;
};
const getReleasedMediasForDate = (
  medias: MediasType | undefined,
  date: Date,
  widget: ICalendarWidget
): MediasType => {
  const { radarrReleaseType } = widget.options;

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
