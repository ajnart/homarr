import { Group, Indicator, Popover, Box, Container, Text, Avatar } from '@mantine/core';
import { useState } from 'react';
import { Calendar } from '@mantine/dates';
import MediaDisplay from './MediaDisplay';
import { medias } from './mediaExample';
import dayjs from 'dayjs';
import { useServices } from '../../tools/state';

function GetCalendars(props: any)
{
  // Load context
  const { services, addService, removeService, setServicesState } = useServices();

}

export default function CalendarComponent(props: any) {
  const [opened, setOpened] = useState(false);
  const dates = medias.map((media) => media.inCinemas);
  const [value, setValue] = useState(null);
  const parsedDates = dates.map((date) => dayjs(date));
  console.log(parsedDates);

  return (
    <Calendar
      value={value}
      onChange={(day) => {
        setValue(day);
      }}
      renderDay={(renderdate) => {
        return <DayComponent renderdate={renderdate} parsedDates={parsedDates} />;
      }}
    />
  );
}

function DayComponent(props: any) {
  const { renderdate, parsedDates }: { renderdate: Date; parsedDates: dayjs.Dayjs[] } = props;
  const [opened, setOpened] = useState(false);

  const day = renderdate.getDate();
  const match = parsedDates.findIndex((date) => date.isSame(dayjs(renderdate), 'day'));

  if (match > -1) {
    return (
      <Avatar
        onClick={() => {
          setOpened(true);
          console.log();
        }}
        radius="xl"
        color="teal"
      >
        <Popover
          position="right"
          width={700}
          onClose={() => setOpened(false)}
          opened={opened}
          target={day}
          children={<MediaDisplay media={medias[match]} />}
        />
      </Avatar>
    );
  }
  return <div>{day}</div>;
}
