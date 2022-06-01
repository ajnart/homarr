/* eslint-disable react/no-children-prop */
import { Box, Divider, Indicator, Popover, ScrollArea } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Calendar } from '@mantine/dates';
import { IconCalendar as CalendarIcon } from '@tabler/icons';
import axios from 'axios';
import { useConfig } from '../../../tools/state';
import { IModule } from '../modules';
import {
  SonarrMediaDisplay,
  RadarrMediaDisplay,
  LidarrMediaDisplay,
  ReadarrMediaDisplay,
} from './MediaDisplay';
import { serviceItem } from '../../../tools/types';

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
  const [lidarrMedias, setLidarrMedias] = useState([] as any);
  const [radarrMedias, setRadarrMedias] = useState([] as any);
  const [readarrMedias, setReadarrMedias] = useState([] as any);
  const sonarrService = config.services.filter((service) => service.type === 'Sonarr').at(0);
  const radarrService = config.services.filter((service) => service.type === 'Radarr').at(0);
  const lidarrService = config.services.filter((service) => service.type === 'Lidarr').at(0);
  const readarrService = config.services.filter((service) => service.type === 'Readarr').at(0);

  function getMedias(service: serviceItem | undefined, type: string) {
    if (!service || !service.apiKey) {
      return Promise.resolve({ data: [] });
    }
    return axios.get(`/api/modules/calendar?type=${type}`, {
      data: {
        body: service,
      },
    });
  }

  useEffect(() => {
    // Filter only sonarr and radarr services

    // Get the url and apiKey for all Sonarr and Radarr services
    getMedias(sonarrService, 'sonarr').then((res) => setSonarrMedias(res.data));
    getMedias(radarrService, 'radarr').then((res) => setRadarrMedias(res.data));
    getMedias(lidarrService, 'lidarr').then((res) => setLidarrMedias(res.data));
    getMedias(readarrService, 'readarr').then((res) => setReadarrMedias(res.data));
  }, [config.services]);

  return (
    <Calendar
      onChange={(day: any) => {}}
      renderDay={(renderdate) => (
        <DayComponent
          renderdate={renderdate}
          sonarrmedias={sonarrMedias}
          radarrmedias={radarrMedias}
          lidarrmedias={lidarrMedias}
          readarrmedias={readarrMedias}
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
    lidarrmedias,
    readarrmedias,
  }: { renderdate: Date; sonarrmedias: []; radarrmedias: []; lidarrmedias: []; readarrmedias: [] } =
    props;
  const [opened, setOpened] = useState(false);

  const day = renderdate.getDate();

  const readarrFiltered = readarrmedias.filter((media: any) => {
    const date = new Date(media.releaseDate);
    return date.getDate() === day && date.getMonth() === renderdate.getMonth();
  });

  const lidarrFiltered = lidarrmedias.filter((media: any) => {
    const date = new Date(media.releaseDate);
    // Return true if the date is renerdate without counting hours and minutes
    return date.getDate() === day && date.getMonth() === renderdate.getMonth();
  });
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
  if (
    sonarrFiltered.length === 0 &&
    radarrFiltered.length === 0 &&
    lidarrFiltered.length === 0 &&
    readarrFiltered.length === 0
  ) {
    return <div>{day}</div>;
  }

  return (
    <Box
      onClick={() => {
        setOpened(true);
      }}
    >
      {readarrFiltered.length > 0 && (
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
      )}
      {radarrFiltered.length > 0 && (
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
      {sonarrFiltered.length > 0 && (
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
      {lidarrFiltered.length > 0 && (
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
      )}
      <Popover
        position="left"
        radius="lg"
        shadow="xl"
        transition="pop"
        styles={{
          body: {
            boxShadow: '0 0 14px 14px rgba(0, 0, 0, 0.1), 0 14px 11px rgba(0, 0, 0, 0.1)',
          },
        }}
        width={700}
        onClose={() => setOpened(false)}
        opened={opened}
        target={day}
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
          {lidarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <LidarrMediaDisplay media={media} />
              {index < lidarrFiltered.length - 1 && <Divider variant="dashed" my="xl" />}
            </React.Fragment>
          ))}
          {readarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <ReadarrMediaDisplay media={media} />
              {index < readarrFiltered.length - 1 && <Divider variant="dashed" my="xl" />}
            </React.Fragment>
          ))}
        </ScrollArea>
      </Popover>
    </Box>
  );
}
