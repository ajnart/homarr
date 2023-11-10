import { Box, Tooltip } from '@mantine/core';
import {
  Icon,
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudSnow,
  IconCloudStorm,
  IconQuestionMark,
  IconSnowflake,
  IconSun,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

interface WeatherIconProps {
  code: number;
  size?: number;
}

/**
 * Icon which should be displayed when specific code is defined
 * @param code weather code from api
 * @returns weather tile component
 */
export const WeatherIcon = ({ code, size = 50 }: WeatherIconProps) => {
  const { t } = useTranslation('modules/weather');

  const { icon: Icon, name } =
    weatherDefinitions.find((wd) => wd.codes.includes(code)) ?? unknownWeather;

  return (
    <Tooltip withinPortal withArrow label={t(`card.weatherDescriptions.${name}`)}>
      <Box>
        <Icon style={{ float: 'left' }} size={size} />
      </Box>
    </Tooltip>
  );
};

type WeatherDefinitionType = { icon: Icon; name: string; codes: number[] };

// 0 Clear sky
// 1, 2, 3 Mainly clear, partly cloudy, and overcast
// 45, 48 Fog and depositing rime fog
// 51, 53, 55 Drizzle: Light, moderate, and dense intensity
// 56, 57 Freezing Drizzle: Light and dense intensity
// 61, 63, 65 Rain: Slight, moderate and heavy intensity
// 66, 67 Freezing Rain: Light and heavy intensity
// 71, 73, 75 Snow fall: Slight, moderate, and heavy intensity
// 77 Snow grains
// 80, 81, 82 Rain showers: Slight, moderate, and violent
// 85, 86Snow showers slight and heavy
// 95 *Thunderstorm: Slight or moderate
// 96, 99 *Thunderstorm with slight and heavy hail
const weatherDefinitions: WeatherDefinitionType[] = [
  { icon: IconSun, name: 'clear', codes: [0] },
  { icon: IconCloud, name: 'mainlyClear', codes: [1, 2, 3] },
  { icon: IconCloudFog, name: 'fog', codes: [45, 48] },
  { icon: IconCloud, name: 'drizzle', codes: [51, 53, 55] },
  { icon: IconSnowflake, name: 'freezingDrizzle', codes: [56, 57] },
  { icon: IconCloudRain, name: 'rain', codes: [61, 63, 65] },
  { icon: IconCloudRain, name: 'freezingRain', codes: [66, 67] },
  { icon: IconCloudSnow, name: 'snowFall', codes: [71, 73, 75] },
  { icon: IconCloudSnow, name: 'snowGrains', codes: [77] },
  { icon: IconCloudRain, name: 'rainShowers', codes: [80, 81, 82] },
  { icon: IconCloudSnow, name: 'snowShowers', codes: [85, 86] },
  { icon: IconCloudStorm, name: 'thunderstorm', codes: [95] },
  { icon: IconCloudStorm, name: 'thunderstormWithHail', codes: [96, 99] },
];

const unknownWeather: Omit<WeatherDefinitionType, 'codes'> = {
  icon: IconQuestionMark,
  name: 'unknown',
};
