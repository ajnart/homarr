import { Group, Indicator, Popover, Box, Container, Text, Avatar } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Calendar } from '@mantine/dates';
import dayjs from 'dayjs';
import MediaDisplay from './MediaDisplay';
import { medias } from './mediaExample';
import { useServices } from '../../tools/state';

async function GetCalendars(endDate: Date) {
  // Load context
  const { services, addService, removeService, setServicesState } = useServices();
  // Load services that have the type to "Sonarr" or "Radarr"
  const sonarrServices = services.filter((service) => service.type === 'Sonarr');
  const radarrServices = services.filter((service) => service.type === 'Radarr');
  // Merge the two arrays
  const allServices = [...sonarrServices, ...radarrServices];
  // Load the calendars for each service
  const Calendars = await Promise.all(
    allServices.map((service) =>
      fetch(`${service.url}/api/v3/calendar?end=${endDate}?apikey=${service.apiKey}`)
    )
  );
  console.log(Calendars);
}

export default function CalendarComponent(props: any) {
  const [opened, setOpened] = useState(false);
  // const [medias, setMedias] = useState();
  const dates = medias.map((media) => media.inCinemas);
  const [value, setValue] = useState(null);
  const parsedDates = dates.map((date) => dayjs(date));
  console.log(parsedDates);

  // useEffect(() => {
  //   const { services } = props;
  //   // Get the url and API key for each service
  //   const serviceUrls = services.map((service: serviceItem) => {
  //     return {
  //       url: service.url,
  //       apiKey: service.apiKey,
  //     };
  //   });
  //   // Get the medias from each service
  //   const promises = serviceUrls.map((service: serviceItem) => {
  //     return fetch(`${service.url}/api/v3/calendar`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'X-Api-Key': service.apiKey,
  //       },
  //     });
  //   });
  //   // Wait for all the promises to resolve
  //   Promise.all(promises).then((responses) => {
  //     // Get the medias from each service
  //     const medias = responses.map((response) => {
  //       return response.json();
  //     });
  //     // Set the medias
  //     setMedias(medias);
  //   }
  //   );
  // }, []);

  return (
    <Calendar
      value={value}
      onChange={(day: any) => {
        setValue(day);
      }}
      renderDay={(renderdate) => <DayComponent renderdate={renderdate} parsedDates={parsedDates} />}
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
