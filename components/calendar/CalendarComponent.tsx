import { Indicator, Popover, Box, Center } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Calendar } from '@mantine/dates';
import MediaDisplay from './MediaDisplay';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';

export default function CalendarComponent(props: any) {
  const { config } = useConfig();
  const [opened, setOpened] = useState(false);
  const [medias, setMedias] = useState([] as any);
  if (medias === undefined) {
    return <div>ok</div>;
  }
  useEffect(() => {
    // Filter only sonarr and radarr services
    const filtered = config.services.filter(
      (service) => service.type === 'Sonarr' || service.type === 'Radarr'
    );

    // Get the url and API key for each service
    const serviceUrls = filtered.map((service: serviceItem) => ({
      url: service.url,
      apiKey: service.apiKey,
    }));

    // Get the medias from each service
    // With no cors
    // const promises = serviceUrls.map((service) =>
    //   fetch('/api/getCalendar', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       apiKey: service.apiKey,
    //       remoteUrl: service.url,
    //     }),
    //   }).then((response) => console.log(response.json()))
    // );
    fetch('http://server:8989/api/calendar?apikey=ea736455118146fea297e6c7465205ce').then(
      (response) => {
        response.json().then((data) => setMedias(data));
      }
    );
  }, [config.services]);

  if (medias === undefined) {
    return <div>ok</div>;
  }

  return (
    <Calendar
      onChange={(day: any) => {}}
      renderDay={(renderdate) => <DayComponent renderdate={renderdate} medias={medias} />}
    />
  );
}

function DayComponent(props: any) {
  const { renderdate, medias }: { renderdate: Date; medias: [] } = props;
  const [opened, setOpened] = useState(false);

  const day = renderdate.getDate();
  // Itterate over the medias and filter the ones that are on the same day
  const filtered = medias.filter((media: any) => {
    const date = new Date(media.airDate);
    return date.getDate() === day;
  });
  if (filtered.length === 0) {
    return <div>{day}</div>;
  }

  return (
    <Box
      onClick={() => {
        setOpened(true);
      }}
      style={{ height: '100%', width: '100%' }}
    >
      <Center>
        <Indicator size={10} color="red">
          <Popover
            position="left"
            width={700}
            onClose={() => setOpened(false)}
            opened={opened}
            target={day}
          >
            <MediaDisplay media={filtered[0]} />
          </Popover>
        </Indicator>
      </Center>
    </Box>
  );
}
