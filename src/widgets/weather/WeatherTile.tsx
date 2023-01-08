import { Center, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconArrowDownRight, IconArrowUpRight, IconCloudRain } from '@tabler/icons';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { useWeatherForCity } from './useWeatherForCity';
import { WeatherIcon } from './WeatherIcon';

const definition = defineWidget({
  id: 'weather',
  icon: IconCloudRain,
  options: {
    displayInFahrenheit: {
      type: 'switch',
      defaultValue: false,
    },
    location: {
      type: 'text',
      defaultValue: 'Paris',
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

export type IWeatherWidget = IWidget<typeof definition['id'], typeof definition>;

interface WeatherTileProps {
  widget: IWeatherWidget;
}

function WeatherTile({ widget }: WeatherTileProps) {
  const { data: weather, isLoading, isError } = useWeatherForCity(widget.properties.location);
  const { width, height, ref } = useElementSize();

  if (isLoading) {
    return (
      <Stack
        ref={ref}
        spacing="xs"
        justify="space-around"
        align="center"
        style={{ height: '100%', width: '100%' }}
      >
        <Skeleton height={40} width={100} mb="xl" />
        <Group noWrap>
          <Skeleton height={50} circle />
          <Group>
            <Skeleton height={25} width={70} mr="lg" />
            <Skeleton height={25} width={70} />
          </Group>
        </Group>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Center>
        <Text weight={500}>An error occured</Text>
      </Center>
    );
  }

  // TODO: add widgetWrapper that is generic and uses the definition
  return (
    <Stack
      ref={ref}
      spacing="xs"
      justify="space-around"
      align="center"
      style={{ height: '100%', width: '100%' }}
    >
      <Group align={'center'} position="center" spacing="xs">
        <WeatherIcon code={weather!.current_weather.weathercode} />
        <Title>
          {getPerferedUnit(
            weather!.current_weather.temperature,
            widget.properties.displayInFahrenheit
          )}
        </Title>
      </Group>
      {width > 200 && (
        <Group noWrap spacing="xs">
          <IconArrowUpRight />
          {getPerferedUnit(
            weather!.daily.temperature_2m_max[0],
            widget.properties.displayInFahrenheit
          )}
          <IconArrowDownRight />
          {getPerferedUnit(
            weather!.daily.temperature_2m_min[0],
            widget.properties.displayInFahrenheit
          )}
        </Group>
      )}
    </Stack>
  );
}

const getPerferedUnit = (value: number, isFahrenheit = false): string =>
  isFahrenheit ? `${(value * (9 / 5) + 32).toFixed(1)}°F` : `${value.toFixed(1)}°C`;

export default definition;
