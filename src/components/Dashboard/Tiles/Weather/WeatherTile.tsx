import { Card, Center, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons';
import { WeatherIcon } from './WeatherIcon';
import { BaseTileProps } from '../type';
import { useWeatherForCity } from './useWeatherForCity';
import { WeatherIntegrationType } from '../../../../types/integration';
import { HomarrCardWrapper } from '../HomarrCardWrapper';
import { IntegrationsMenu } from '../Integrations/IntegrationsMenu';

interface WeatherTileProps extends BaseTileProps {
  module: WeatherIntegrationType | undefined;
}

export const WeatherTile = ({ className, module }: WeatherTileProps) => {
  const {
    data: weather,
    isLoading,
    isError,
  } = useWeatherForCity(module?.properties.location ?? 'Paris');

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

  return (
    <HomarrCardWrapper className={className}>
      <IntegrationsMenu
        integration="weather"
        module={module}
        options={module?.properties}
        labels={{
          isFahrenheit: 'descriptor.settings.displayInFahrenheit.label',
          location: 'descriptor.settings.location.label',
        }}
      />
      <Center style={{ height: '100%' }}>
        <Group spacing="md" noWrap align="center">
          <WeatherIcon code={weather!.current_weather.weathercode} />
          <Stack p={0} spacing={4}>
            <Title order={2}>
              {getPerferedUnit(
                weather!.current_weather.temperature,
                module?.properties.isFahrenheit
              )}
            </Title>
            <Group spacing="xs" noWrap>
              <div>
                <span>
                  {getPerferedUnit(
                    weather!.daily.temperature_2m_max[0],
                    module?.properties.isFahrenheit
                  )}
                </span>
                <IconArrowUpRight size={16} style={{ right: 15 }} />
              </div>
              <div>
                <span>
                  {getPerferedUnit(
                    weather!.daily.temperature_2m_min[0],
                    module?.properties.isFahrenheit
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
};

const getPerferedUnit = (value: number, isFahrenheit: boolean = false): string => {
  return isFahrenheit ? `${(value * (9 / 5) + 32).toFixed(1)}°F` : `${value.toFixed(1)}°C`;
};
