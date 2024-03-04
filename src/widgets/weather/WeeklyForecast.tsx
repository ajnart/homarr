import { Card, Flex, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import { WeatherIcon } from './WeatherIcon';

const Forecast = ({ daily, getPerferedUnit, widget }) => {
  const { width } = useElementSize();
  return (
    <Flex align="center" direction="row" justify="space-between">
      {daily.time.slice(0, widget.properties.forecastDays).map((time: any, index: number) => (
        <Card key={index} padding="0.25rem">
          <Flex direction="column" align="center">
            <Text fw={700} lh="1.25rem">
              {time.split('-')[2]}
            </Text>
            <WeatherIcon size={width < 300 ? 30 : 50} code={daily.weathercode[index]} />
            <Text fz="sm" lh="1rem">
              {getPerferedUnit(
                daily.temperature_2m_max[index],
                widget.properties.displayInFahrenheit
              )}
            </Text>
            <Text fz="sm" lh="1rem" color="grey">
              {getPerferedUnit(
                daily.temperature_2m_min[index],
                widget.properties.displayInFahrenheit
              )}
            </Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};

export default Forecast;
