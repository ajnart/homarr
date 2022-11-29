/* eslint-disable react/no-children-prop */
import {
  Box,
  Divider,
  Indicator,
  Popover,
  ScrollArea,
  createStyles,
  useMantineTheme,
  Space,
} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Calendar } from '@mantine/dates';
import { IconCalendar as CalendarIcon } from '@tabler/icons';
import axios from 'axios';
import { useDisclosure } from '@mantine/hooks';
import { useConfig } from '../../tools/state';
import { IModule } from '../ModuleTypes';
import {
  SonarrMediaDisplay,
  RadarrMediaDisplay,
  LidarrMediaDisplay,
  ReadarrMediaDisplay,
} from '../common';
import { serviceItem } from '../../tools/types';
import { useColorTheme } from '../../tools/color';

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
    return axios.post(`/api/modules/calendar?type=${type}`, { id: service.id });
  }

  useEffect(() => {
    // Create each Sonarr service and get the medias
    const currentSonarrMedias: any[] = [];
    Promise.all(
      sonarrServices.map((service) =>
        getMedias(service, 'sonarr')
          .then((res) => {
            currentSonarrMedias.push(...res.data);
          })
          .catch(() => {
            currentSonarrMedias.push([]);
          })
      )
    ).then(() => {
      setSonarrMedias(currentSonarrMedias);
    });
    const currentRadarrMedias: any[] = [];
    Promise.all(
      radarrServices.map((service) =>
        getMedias(service, 'radarr')
          .then((res) => {
            currentRadarrMedias.push(...res.data);
          })
          .catch(() => {
            currentRadarrMedias.push([]);
          })
      )
    ).then(() => {
      setRadarrMedias(currentRadarrMedias);
    });
    const currentLidarrMedias: any[] = [];
    Promise.all(
      lidarrServices.map((service) =>
        getMedias(service, 'lidarr')
          .then((res) => {
            currentLidarrMedias.push(...res.data);
          })
          .catch(() => {
            currentLidarrMedias.push([]);
          })
      )
    ).then(() => {
      setLidarrMedias(currentLidarrMedias);
    });
    const currentReadarrMedias: any[] = [];
    Promise.all(
      readarrServices.map((service) =>
        getMedias(service, 'readarr')
          .then((res) => {
            currentReadarrMedias.push(...res.data);
          })
          .catch(() => {
            currentReadarrMedias.push([]);
          })
      )
    ).then(() => {
      setReadarrMedias(currentReadarrMedias);
    });
  }, [config.services]);

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
      allowLevelChange={false}
      dayClassName={(date, modifiers) => cx({ [classes.weekend]: modifiers.weekend })}
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
  const [opened, { close, open }] = useDisclosure(false);

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
  const totalFiltered = [
    ...readarrFiltered,
    ...lidarrFiltered,
    ...sonarrFiltered,
    ...radarrFiltered,
  ];
  if (totalFiltered.length === 0) {
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
          <div>{day}</div>
        </Box>
      </Popover.Target>
      <Popover.Dropdown>
        <ScrollArea
          offsetScrollbars
          scrollbarSize={5}
          style={{
            height:
              totalFiltered.slice(0, 2).length > 1 ? totalFiltered.slice(0, 2).length * 150 : 220,
            width: 400,
          }}
        >
          <Space mt={5} />
          {sonarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <SonarrMediaDisplay media={media} />
              {index < sonarrFiltered.length - 1 && <Divider variant="dashed" size="sm" my="xl" />}
            </React.Fragment>
          ))}
          {radarrFiltered.length > 0 && sonarrFiltered.length > 0 && (
            <Divider variant="dashed" size="sm" my="xl" />
          )}
          {radarrFiltered.map((media: any, index: number) => (
            <React.Fragment key={index}>
              <RadarrMediaDisplay media={media} />
              {index < radarrFiltered.length - 1 && <Divider variant="dashed" size="sm" my="xl" />}
            </React.Fragment>
          ))}
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
          ))}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
}
