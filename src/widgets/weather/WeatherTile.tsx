import { Center, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowDownRight, IconArrowUpRight, IconCloudRain } from '@tabler/icons';
import { HomarrCardWrapper } from '../../components/Dashboard/Tiles/HomarrCardWrapper';
import { BaseTileProps } from '../../components/Dashboard/Tiles/type';
import { WidgetsMenu } from '../../components/Dashboard/Tiles/Widgets/WidgetsMenu';
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
    minWidth: 4,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: WeatherTile,
});

export type IWeatherWidget = IWidget<typeof definition['id'], typeof definition>;

interface WeatherTileProps extends BaseTileProps {
  module: IWeatherWidget;
}

function WeatherTile({ className, module }: WeatherTileProps) {
  const { data: weather, isLoading, isError } = useWeatherForCity(module.properties.location);

  if (isLoading) {
    return (
      <HomarrCardWrapper className={className}>
        <Skeleton height={40} width={100} mb="xl" />
        <Group noWrap>
          <Skeleton height={50} circle />
          <Group>
            <Skeleton height={25} width={70} mr="lg" />
            <Skeleton height={25} width={70} />
          </Group>
        </Group>
      </HomarrCardWrapper>
    );
  }

  if (isError) {
    return (
      <HomarrCardWrapper className={className}>
        <Center>
          <Text weight={500}>An error occured</Text>
        </Center>
      </HomarrCardWrapper>
    );
  }

  // TODO: add widgetWrapper that is generic and uses the definition
  return (
    <HomarrCardWrapper className={className}>
      <WidgetsMenu integration={definition.id} module={module} />
      <Center style={{ height: '100%' }}>
        <Group spacing="md" noWrap align="center">
          <WeatherIcon code={weather!.current_weather.weathercode} />
          <Stack p={0} spacing={4}>
            <Title order={2}>
              {getPerferedUnit(
                weather!.current_weather.temperature,
                module.properties.displayInFahrenheit
              )}
            </Title>
            <Group spacing="xs" noWrap>
              <div>
                <span>
                  {getPerferedUnit(
                    weather!.daily.temperature_2m_max[0],
                    module.properties.displayInFahrenheit
                  )}
                </span>
                <IconArrowUpRight size={16} style={{ right: 15 }} />
              </div>
              <div>
                <span>
                  {getPerferedUnit(
                    weather!.daily.temperature_2m_min[0],
                    module.properties.displayInFahrenheit
                  )}
                </span>
                <IconArrowDownRight size={16} />
              </div>
            </Group>
          </Stack>
        </Group>
      </Center>
    </HomarrCardWrapper>
  );
}

const getPerferedUnit = (value: number, isFahrenheit = false): string =>
  isFahrenheit ? `${(value * (9 / 5) + 32).toFixed(1)}°F` : `${value.toFixed(1)}°C`;

export default definition;
