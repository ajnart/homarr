/* eslint-disable react/no-children-prop */
import { Box, Divider, Indicator, Popover, ScrollArea, createStyles } from '@mantine/core';
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
} from '../common';
import { serviceItem } from '../../../tools/types';
import { useColorTheme } from '../../../tools/color';

export const CalendarModule: IModule = {
  title: 'Calendar',
  description:
    'A calendar module for displaying upcoming releases. It interacts with the Sonarr and Radarr API.',
  icon: CalendarIcon,
  component: CalendarComponent,
};

export default function CalendarComponent(props: any) {
  const { config } = useConfig();
  const { secondaryColor } = useColorTheme();
  const useStyles = createStyles(() => ({
      weekend: {
      color: `${secondaryColor} !important`,
    },
  }));
  const [sonarrMedias, setSonarrMedias] = useState([] as any);
  const [lidarrMedias, setLidarrMedias] = useState([] as any);
  const [radarrMedias, setRadarrMedias] = useState([] as any);
  const [readarrMedias, setReadarrMedias] = useState([] as any);
  const sonarrServices = config.services.filter((service) => service.type === 'Sonarr');
  const radarrServices = config.services.filter((service) => service.type === 'Radarr');
  const lidarrServices = config.services.filter((service) => service.type === 'Lidarr');
  const readarrServices = config.services.filter((service) => service.type === 'Readarr');
  const today = new Date();

  const { classes, cx } = useStyles();

  function getMedias(service: serviceItem | undefined, type: string) {
    if (!service || !service.apiKey) {
      return Promise.resolve({ data: [] });
    }
    return axios.post(`/api/modules/calendar?type=${type}`, { ...service });
  }

  useEffect(() => {
    // Create each Sonarr service and get the medias
    const currentSonarrMedias: any[] = [...sonarrMedias];
    Promise.all(
      sonarrServices.map((service) =>
        getMedias(service, 'sonarr').then((res) => {
          currentSonarrMedias.push(...res.data);
        })
      )
    ).then(() => {
      setSonarrMedias(currentSonarrMedias);
    });
    const currentRadarrMedias: any[] = [...radarrMedias];
    Promise.all(
      radarrServices.map((service) =>
        getMedias(service, 'radarr').then((res) => {
          currentRadarrMedias.push(...res.data);
        })
      )
    ).then(() => {
      setRadarrMedias(currentRadarrMedias);
    });
    const currentLidarrMedias: any[] = [...lidarrMedias];
    Promise.all(
      lidarrServices.map((service) =>
        getMedias(service, 'lidarr').then((res) => {
          currentLidarrMedias.push(...res.data);
        })
      )
    ).then(() => {
      setLidarrMedias(currentLidarrMedias);
    });
    const currentReadarrMedias: any[] = [...readarrMedias];
    Promise.all(
      readarrServices.map((service) =>
        getMedias(service, 'readarr').then((res) => {
          currentReadarrMedias.push(...res.data);
        })
      )
    ).then(() => {
      setReadarrMedias(currentReadarrMedias);
    });
  }, [config.services]);

  return (
    <Calendar
      onChange={(day: any) => {}}
      dayStyle={(date) =>
        date.getDay() === today.getDay() && date.getDate() === today.getDate()
          ? { backgroundColor: '#2C2E33' }
          : {}
      }
      dayClassName={(date, modifiers) =>
        cx({ [classes.weekend]: modifiers.weekend })
      }
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
    return date.toDateString() === renderdate.toDateString();
  });

  const lidarrFiltered = lidarrmedias.filter((media: any) => {
    const date = new Date(media.releaseDate);
    return date.toDateString() === renderdate.toDateString();
  });
  const sonarrFiltered = sonarrmedias.filter((media: any) => {
    const date = new Date(media.airDateUtc);
    return date.toDateString() === renderdate.toDateString();
  });
  const radarrFiltered = radarrmedias.filter((media: any) => {
    const date = new Date(media.inCinemas);
    return date.toDateString() === renderdate.toDateString();
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
        position="bottom"
        radius="lg"
        shadow="xl"
        transition="pop"
        styles={{
          body: {
            boxShadow: '0 0 14px 14px rgba(0, 0, 0, 0.1), 0 14px 11px rgba(0, 0, 0, 0.1)',
          },
        }}
        width="auto"
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
          {sonarrFiltered.length > 0 && lidarrFiltered.length > 0 && (
            <Divider variant="dashed" my="xl" />
          )}
          {lidarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <LidarrMediaDisplay media={media} />
              {index < lidarrFiltered.length - 1 && <Divider variant="dashed" my="xl" />}
            </React.Fragment>
          ))}
          {lidarrFiltered.length > 0 && readarrFiltered.length > 0 && (
            <Divider variant="dashed" my="xl" />
          )}
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
