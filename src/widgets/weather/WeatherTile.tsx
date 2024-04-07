import { Card, Center, Flex, Group, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCloudRain,
  IconMapPin,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Weather } from '~/server/api/routers/weather';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { WeatherIcon } from './WeatherIcon';

const definition = defineWidget({
  id: 'weather',
  icon: IconCloudRain,
  options: {
    displayInFahrenheit: {
      type: 'switch',
      defaultValue: false,
    },
    displayCityName: {
      type: 'switch',
      defaultValue: false,
    },
    displayWeekly: {
      type: 'switch',
      defaultValue: false,
    },
    forecastDays: {
      type: 'slider',
      defaultValue: 5,
      min: 1,
      max: 7,
      step: 1,
    },
    location: {
      type: 'location',
      defaultValue: {
        name: 'Paris',
        latitude: 48.85341,
        longitude: 2.3488,
      },
    },
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: WeatherTile,
});

export type IWeatherWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface WeatherTileProps {
  widget: IWeatherWidget;
}

function WeatherTile({ widget }: WeatherTileProps) {
  const {
    data: weather,
    isLoading,
    isError,
  } = api.weather.at.useQuery(widget.properties.location, { refetchInterval: 1000 * 60 * 30 });
  const { width, ref } = useElementSize();
  const { t } = useTranslation('modules/weather');

  if (isLoading) {
    return <WidgetLoading />;
  }

  if (isError) {
    return (
      <Center>
        <Text weight={500}>{t('error')}</Text>
      </Center>
    );
  }

  return (
    <Stack w="100%" h="100%" justify="space-around" ref={ref} spacing={0} align="center">
      {(widget?.properties.displayWeekly && (
        <>
          <Flex
            align="center"
            gap={width < 120 ? '0.25rem' : 'xs'}
            justify={'center'}
            direction={'row'}
          >
            {widget.properties.displayCityName && (
              <Group noWrap spacing={5} align="center">
                <IconMapPin color="blue" size={30} />
                <Text size={25} style={{ whiteSpace: 'nowrap' }}>
                  {widget.properties.location.name}
                </Text>
              </Group>
            )}
            <WeatherIcon size={width < 300 ? 30 : 50} code={weather.current_weather.weathercode} />
            <Title size={'h2'} color={weather.current_weather.temperature > 20 ? 'red' : 'blue'}>
              {getPreferredUnit(
                weather.current_weather.temperature,
                widget.properties.displayInFahrenheit
              )}
            </Title>
          </Flex>
          <Forecast weather={weather} widget={widget} />
        </>
      )) || (
        <>
          <Flex
            align="center"
            gap={width < 120 ? '0.25rem' : 'xs'}
            justify={'center'}
            direction={width < 200 ? 'column' : 'row'}
          >
            <WeatherIcon size={width < 300 ? 30 : 50} code={weather.current_weather.weathercode} />
            <Title size={'h2'}>
              {getPreferredUnit(
                weather.current_weather.temperature,
                widget.properties.displayInFahrenheit
              )}
            </Title>
          </Flex>

          {width > 200 && (
            <Group noWrap spacing="xs">
              <IconArrowUpRight />
              {getPreferredUnit(
                weather.daily.temperature_2m_max[0],
                widget.properties.displayInFahrenheit
              )}
              <IconArrowDownRight />
              {getPreferredUnit(
                weather.daily.temperature_2m_min[0],
                widget.properties.displayInFahrenheit
              )}
            </Group>
          )}

          {widget.properties.displayCityName && (
            <Group noWrap spacing={5} align="center">
              <IconMapPin height={15} width={15} />
              <Text style={{ whiteSpace: 'nowrap' }}>{widget.properties.location.name}</Text>
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}

const getPreferredUnit = (value: number, isFahrenheit = false): string =>
  isFahrenheit ? `${(value * (9 / 5) + 32).toFixed(1)}°F` : `${value.toFixed(1)}°C`;

interface ForecastProps {
  weather: Weather;
  widget: IWeatherWidget;
}

function Forecast({ weather: { daily }, widget }: ForecastProps) {
  const { width } = useElementSize();
  return (
    <Flex align="center" direction="row" justify="space-between" w="100%" px="sm">
      {daily.time.slice(0, widget.properties.forecastDays).map((time: any, index: number) => (
        <Card key={index} padding="0.25rem">
          <Flex direction="column" align="center">
            <Text fw={700} lh="1.25rem">
              {time.split('-')[2]}
            </Text>
            <WeatherIcon size={width < 300 ? 30 : 50} code={daily.weathercode[index]} />
            <Text fz="sm" lh="1rem">
              {getPreferredUnit(
                daily.temperature_2m_max[index],
                widget.properties.displayInFahrenheit
              )}
            </Text>
            <Text fz="sm" lh="1rem" color="grey">
              {getPreferredUnit(
                daily.temperature_2m_min[index],
                widget.properties.displayInFahrenheit
              )}
            </Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

export default definition;
