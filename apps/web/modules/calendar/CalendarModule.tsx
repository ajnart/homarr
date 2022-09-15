/* eslint-disable react/no-children-prop */
import {
  Box,
  Divider,
  Indicator,
  Popover,
  ScrollArea,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import React from 'react';
import { Calendar } from '@mantine/dates';
import { IconCalendar as CalendarIcon } from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import { MovieCalendarItem, TvCalendarItem, useGetCalendarQuery } from '@homarr/graphql';
import dayjs from 'dayjs';
import { useConfig } from '../../lib/state';
import { IModule } from '../ModuleTypes';
import { RadarrMediaDisplay, SonarrMediaDisplay } from '../common';
import { useColorTheme } from '../../lib/color';

export const CalendarModule: IModule = {
  title: 'Calendar',
  icon: CalendarIcon,
  component: CalendarComponent,
  options: {
    sundaystart: {
      name: 'descriptor.settings.sundayStart.label',
      value: false,
    },
  },
  id: 'calendar',
  dataKey: 'calendar',
};

export default function CalendarComponent(props: any) {
  const { config } = useConfig();
  const theme = useMantineTheme();
  const { secondaryColor } = useColorTheme();
  const useStyles = createStyles((theme) => ({
    weekend: {
      color: `${secondaryColor} !important`,
    },
  }));

  const today = new Date();

  const { classes, cx } = useStyles();

  const { data } = useGetCalendarQuery({
    variables: {
      startDate: dayjs().startOf('month').toDate(),
      endDate: dayjs().endOf('month').toDate(),
    },
  });

  const weekStartsAtSunday =
    (config?.modules?.[CalendarModule.id]?.options?.sundaystart?.value as boolean) ?? false;
  return (
    <Calendar
      firstDayOfWeek={weekStartsAtSunday ? 'sunday' : 'monday'}
      onChange={(day: any) => {}}
      dayStyle={(date) =>
        date.getDay() === today.getDay() && date.getDate() === today.getDate()
          ? {
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
              margin: 1,
            }
          : {
              margin: 1,
            }
      }
      styles={{
        calendarHeader: {
          marginRight: 40,
          marginLeft: 40,
        },
      }}
      allowLevelChange={false}
      dayClassName={(date, modifiers) => cx({ [classes.weekend]: modifiers.weekend })}
      renderDay={(renderDate) => (
        <DayComponent renderDate={renderDate} media={data?.calendar || []} />
      )}
    />
  );
}

function DayComponent({
  media,
  renderDate,
}: {
  renderDate: Date;
  media: (TvCalendarItem | MovieCalendarItem)[];
}) {
  const [opened, { close, open }] = useDisclosure(false);

  const day = renderDate.getDate();

  const movieItems = media.filter(
    (m) => m.__typename === 'MovieCalendarItem' && dayjs(renderDate).isSame(m.digitalDate, 'day')
  );
  const tvItems = media.filter(
    (m) => m.__typename === 'TvCalendarItem' && dayjs(renderDate).isSame(m.airDate, 'day')
  );

  if (!movieItems.length && !tvItems.length) {
    return <div>{day}</div>;
  }

  return (
    <Popover
      position="bottom"
      withArrow
      withinPortal
      radius="lg"
      shadow="sm"
      transition="pop"
      onClose={close}
      opened={opened}
    >
      <Popover.Target>
        <Box onClick={open}>
          {/* {readarrFiltered.length > 0 && (
            <Indicator
              size={10}
              withBorder
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
              }}
              color="red"
              children={null}
            />
          )} */}
          {movieItems.length > 0 && (
            <Indicator
              size={10}
              withBorder
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
              }}
              color="yellow"
              children={null}
            />
          )}
          {tvItems.length > 0 && (
            <Indicator
              size={10}
              withBorder
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
              color="blue"
              children={null}
            />
          )}
          {/* {lidarrFiltered.length > 0 && (
            <Indicator
              size={10}
              withBorder
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
              }}
              color="green"
              children={undefined}
            />
          )}*/}
          <div>{day}</div>
        </Box>
      </Popover.Target>
      <Popover.Dropdown>
        <ScrollArea
          offsetScrollbars
          scrollbarSize={5}
          style={{
            height: media.slice(0, 2).length > 1 ? media.slice(0, 2).length * 150 : 200,
            width: 400,
          }}
        >
          {tvItems.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <SonarrMediaDisplay media={media} />
              {index < tvItems.length - 1 && <Divider variant="dashed" size="sm" my="xl" />}
            </React.Fragment>
          ))}
          {movieItems.length > 0 && tvItems.length > 0 && (
            <Divider variant="dashed" size="sm" my="xl" />
          )}
          {movieItems.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <RadarrMediaDisplay media={media} />
              {index < movieItems.length - 1 && <Divider variant="dashed" size="sm" my="xl" />}
            </React.Fragment>
          ))}
          {/* {
          {sonarrFiltered.length > 0 && lidarrFiltered.length > 0 && (
            <Divider variant="dashed" size="sm" my="xl" />
          )}
          {lidarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <LidarrMediaDisplay media={media} />
              {index < lidarrFiltered.length - 1 && <Divider variant="dashed" size="sm" my="xl" />}
            </React.Fragment>
          ))}
          {lidarrFiltered.length > 0 && readarrFiltered.length > 0 && (
            <Divider variant="dashed" size="sm" my="xl" />
          )}
          {readarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <ReadarrMediaDisplay media={media} />
              {index < readarrFiltered.length - 1 && <Divider variant="dashed" size="sm" my="xl" />}
            </React.Fragment>
          ))} */}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
}
