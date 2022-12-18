import { createStyles, MantineThemeColors, useMantineTheme } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconCalendarTime } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { HomarrCardWrapper } from '../../components/Dashboard/Tiles/HomarrCardWrapper';
import { BaseTileProps } from '../../components/Dashboard/Tiles/type';
import { useConfigContext } from '../../config/provider';
import { useColorTheme } from '../../tools/color';
import { isToday } from '../../tools/isToday';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { CalendarDay } from './CalendarDay';
import { MediasType } from './type';

const definition = defineWidget({
  id: 'calendar',
  icon: IconCalendarTime,
  options: {
    sundayStart: {
      type: 'switch',
      defaultValue: false,
    },
  },
  component: CalendarTile,
});

export type ICalendarWidget = IWidget<typeof definition['id'], typeof definition>;

interface CalendarTileProps extends BaseTileProps {
  module: ICalendarWidget;
}

function CalendarTile({ className, module }: CalendarTileProps) {
  const { secondaryColor } = useColorTheme();
  const { name: configName } = useConfigContext();
  const { classes, cx } = useStyles(secondaryColor);
  const { colorScheme, colors } = useMantineTheme();
  const [month, setMonth] = useState(new Date());

  const { data: medias } = useQuery({
    queryKey: ['calendar/medias', { month: month.getMonth(), year: month.getFullYear() }],
    queryFn: async () =>
      (await (
        await fetch(
          `/api/modules/calendar?year=${month.getFullYear()}&month=${
            month.getMonth() + 1
          }&configName=${configName}`
        )
      ).json()) as MediasType,
  });

  return (
    <HomarrCardWrapper className={className} p={6}>
      <Calendar
        month={month}
        onMonthChange={setMonth}
        size="xs"
        fullWidth
        onChange={() => {}}
        firstDayOfWeek={module.properties.sundayStart ? 'sunday' : 'monday'}
        dayStyle={(date) => ({
          margin: 1,
          backgroundColor: isToday(date)
            ? colorScheme === 'dark'
              ? colors.dark[5]
              : colors.gray[0]
            : undefined,
        })}
        styles={{
          calendarHeader: {
            marginRight: 40,
            marginLeft: 40,
          },
        }}
        allowLevelChange={false}
        dayClassName={(_, modifiers) => cx({ [classes.weekend]: modifiers.weekend })}
        renderDay={(date) => (
          <CalendarDay date={date} medias={getReleasedMediasForDate(medias, date)} />
        )}
      />
    </HomarrCardWrapper>
  );
}

const useStyles = createStyles((theme, secondaryColor: keyof MantineThemeColors) => ({
  weekend: {
    color: `${secondaryColor} !important`,
  },
}));

const getReleasedMediasForDate = (medias: MediasType | undefined, date: Date): MediasType => {
  const books =
    medias?.books.filter((b) => new Date(b.releaseDate).toDateString() === date.toDateString()) ??
    [];
  const movies =
    medias?.movies.filter((m) => new Date(m.inCinemas).toDateString() === date.toDateString()) ??
    [];
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
