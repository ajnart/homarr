import { Center, Flex, Group, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCloudRain,
  IconMapPin,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { WeatherIcon } from './WeatherIcon';
import Forecast from './WeeklyForecast';

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
  const { data: weather, isLoading, isError } = api.weather.at.useQuery(widget.properties.location);
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

  // TODO: add widgetWrapper that is generic and uses the definition
  return (
    <>
      {widget?.properties.displayWeekly ? (
        <Stack w="100%" h="100%" justify="space-between" ref={ref} spacing={0} align="center">
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
              {getPerferedUnit(
                weather.current_weather.temperature,
                widget.properties.displayInFahrenheit
              )}
            </Title>
          </Flex>
          <Forecast daily={weather?.daily} getPerferedUnit={getPerferedUnit} widget={widget} />
        </Stack>
      ) : (
        <Stack
          style={{ height: '100%', width: '100%' }}
          justify="space-around"
          ref={ref}
          spacing={0}
          align="center"
        >
          <Flex
            align="center"
            gap={width < 120 ? '0.25rem' : 'xs'}
            justify={'center'}
            direction={width < 200 ? 'column' : 'row'}
          >
            <WeatherIcon size={width < 300 ? 30 : 50} code={weather.current_weather.weathercode} />
            <Title size={'h2'}>
              {getPerferedUnit(
                weather.current_weather.temperature,
                widget.properties.displayInFahrenheit
              )}
            </Title>
          </Flex>

          {width > 200 && (
            <Group noWrap spacing="xs">
              <IconArrowUpRight />
              {getPerferedUnit(
                weather.daily.temperature_2m_max[0],
                widget.properties.displayInFahrenheit
              )}
              <IconArrowDownRight />
              {getPerferedUnit(
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
        </Stack>
      )}
    </>
  );
}

const getPerferedUnit = (value: number, isFahrenheit = false): string =>
  isFahrenheit ? `${(value * (9 / 5) + 32).toFixed(1)}°F` : `${value.toFixed(1)}°C`;

export default definition;
