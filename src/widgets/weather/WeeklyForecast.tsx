import { Card, Flex, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import { WeatherIcon } from './WeatherIcon';

const Forecast = ({ daily, getPerferedUnit, widget }) => {
  const { width } = useElementSize();
  return (
    <Flex align="center" direction="row">
      {daily.time.slice(0, widget.properties.forecastDays).map((time: any, index: number) => (
        <Card key={index}>
          <Flex direction="column" align="center">
            <Text fz="lg" fw={700}>
              {time.split('-')[2]}
            </Text>
            <WeatherIcon size={width < 300 ? 30 : 50} code={daily.weathercode[index]} />
            <Text>
              {getPerferedUnit(
                daily.temperature_2m_max[index],
                widget.properties.displayInFahrenheit
              )}
            </Text>
            <Text color="grey">
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
