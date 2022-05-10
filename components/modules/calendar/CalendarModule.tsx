/* eslint-disable react/no-children-prop */
import { Popover, Box, ScrollArea, Divider, Indicator } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Calendar } from '@mantine/dates';
import { CalendarIcon } from '@modulz/radix-icons';
import { RadarrMediaDisplay, SonarrMediaDisplay } from './MediaDisplay';
import { useConfig } from '../../../tools/state';
import { IModule } from '../modules';

export const CalendarModule: IModule = {
  title: 'Calendar',
  description:
    'A calendar module for displaying upcoming releases. It interacts with the Sonarr and Radarr API.',
  icon: CalendarIcon,
  component: CalendarComponent,
};

export default function CalendarComponent(props: any) {
  const { config } = useConfig();
  const [sonarrMedias, setSonarrMedias] = useState([] as any);
  const [radarrMedias, setRadarrMedias] = useState([] as any);

  useEffect(() => {
    // Filter only sonarr and radarr services
    const filtered = config.services.filter(
      (service) => service.type === 'Sonarr' || service.type === 'Radarr'
    );

    // Get the url and apiKey for all Sonarr and Radarr services
    const sonarrService = filtered.filter((service) => service.type === 'Sonarr').at(0);
    const radarrService = filtered.filter((service) => service.type === 'Radarr').at(0);
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString();
    if (sonarrService && sonarrService.apiKey) {
      fetch(
        `${sonarrService?.url}api/calendar?apikey=${sonarrService?.apiKey}&end=${nextMonth}`
      ).then((response) => {
        response.ok && response.json().then((data) => setSonarrMedias(data));
      });
    }
    if (radarrService && radarrService.apiKey) {
      fetch(
        `${radarrService?.url}api/v3/calendar?apikey=${radarrService?.apiKey}&end=${nextMonth}`
      ).then((response) => {
        response.ok && response.json().then((data) => setRadarrMedias(data));
      });
    }
  }, [config.services]);

  if (sonarrMedias === undefined && radarrMedias === undefined) {
    return <Calendar />;
  }
  return (
    <Calendar
      onChange={(day: any) => {}}
      renderDay={(renderdate) => (
        <DayComponent
          renderdate={renderdate}
          sonarrmedias={sonarrMedias}
          radarrmedias={radarrMedias}
        />
      )}
    />
  );
}

function DayComponent(props: any) {
  const {
    renderdate,
    sonarrmedias,
    radarrmedias,
  }: { renderdate: Date; sonarrmedias: []; radarrmedias: [] } = props;
  const [opened, setOpened] = useState(false);

  const day = renderdate.getDate();
  // Itterate over the medias and filter the ones that are on the same day
  const sonarrFiltered = sonarrmedias.filter((media: any) => {
    const date = new Date(media.airDate);
    // Return true if the date is renerdate without counting hours and minutes
    return date.getDate() === day && date.getMonth() === renderdate.getMonth();
  });
  const radarrFiltered = radarrmedias.filter((media: any) => {
    const date = new Date(media.inCinemas);
    // Return true if the date is renerdate without counting hours and minutes
    return date.getDate() === day && date.getMonth() === renderdate.getMonth();
  });
  if (sonarrFiltered.length === 0 && radarrFiltered.length === 0) {
    return <div>{day}</div>;
  }

  return (
    <Box
      onClick={() => {
        setOpened(true);
      }}
    >
      {radarrFiltered.length > 0 && <Indicator size={7} color="yellow" children={null} />}
      {sonarrFiltered.length > 0 && <Indicator size={7} offset={8} color="blue" children={null} />}
      <Popover
        position="left"
        width={700}
        onClose={() => setOpened(false)}
        opened={opened}
        // TODO: Fix this !! WTF ?
        target={`‏ ${day}`}
      >
        <ScrollArea style={{ height: 400 }}>
          {sonarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <SonarrMediaDisplay media={media} />
              {index < sonarrFiltered.length - 1 && <Divider variant="dashed" my="xl" />}
            </React.Fragment>
          ))}
          {radarrFiltered.length > 0 && sonarrFiltered.length > 0 && (
            <Divider variant="dashed" my="xl" />
          )}
          {radarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <RadarrMediaDisplay media={media} />
              {index < radarrFiltered.length - 1 && <Divider variant="dashed" my="xl" />}
            </React.Fragment>
          ))}
        </ScrollArea>
      </Popover>
    </Box>
  );
}
