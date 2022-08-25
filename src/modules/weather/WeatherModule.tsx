import { Group, Space, Title, Tooltip, Skeleton, Stack, Box } from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  IconArrowDownRight as ArrowDownRight,
  IconArrowUpRight as ArrowUpRight,
  IconCloud as Cloud,
  IconCloudFog as CloudFog,
  IconCloudRain as CloudRain,
  IconCloudSnow as CloudSnow,
  IconCloudStorm as CloudStorm,
  IconQuestionMark as QuestionMark,
  IconSnowflake as Snowflake,
  IconSun as Sun,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';
import { IModule } from '../ModuleTypes';
import { WeatherResponse } from './WeatherInterface';

export const WeatherModule: IModule = {
  title: 'Weather',
  icon: Sun,
  component: WeatherComponent,
  options: {
    freedomunit: {
      name: 'descriptor.settings.displayInFahrenheit.label',
      value: false,
    },
    location: {
      name: 'descriptor.settings.location.label',
      value: 'Paris',
    },
  },
  id: 'weather',
};

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
export function WeatherIcon(props: any) {
  const { t } = useTranslation('modules/weather');

  const { code } = props;
  let data: { icon: any; name: string };
  switch (code) {
    case 0: {
      data = { icon: Sun, name: t('card.weatherDescriptions.clear') };
      break;
    }
    case 1:
    case 2:
    case 3: {
      data = { icon: Cloud, name: t('card.weatherDescriptions.mainlyClear') };
      break;
    }
    case 45:
    case 48: {
      data = { icon: CloudFog, name: t('card.weatherDescriptions.fog') };
      break;
    }
    case 51:
    case 53:
    case 55: {
      data = { icon: Cloud, name: t('card.weatherDescriptions.drizzle') };
      break;
    }
    case 56:
    case 57: {
      data = {
        icon: Snowflake,
        name: t('card.weatherDescriptions.freezingDrizzle'),
      };
      break;
    }
    case 61:
    case 63:
    case 65: {
      data = { icon: CloudRain, name: t('card.weatherDescriptions.rain') };
      break;
    }
    case 66:
    case 67: {
      data = { icon: CloudRain, name: t('card.weatherDescriptions.freezingRain') };
      break;
    }
    case 71:
    case 73:
    case 75: {
      data = { icon: CloudSnow, name: t('card.weatherDescriptions.snowFall') };
      break;
    }
    case 77: {
      data = { icon: CloudSnow, name: t('card.weatherDescriptions.snowGrains') };
      break;
    }
    case 80:
    case 81:
    case 82: {
      data = { icon: CloudRain, name: t('card.weatherDescriptions.rainShowers') };

      break;
    }
    case 85:
    case 86: {
      data = { icon: CloudSnow, name: t('card.weatherDescriptions.snowShowers') };
      break;
    }
    case 95: {
      data = { icon: CloudStorm, name: t('card.weatherDescriptions.thunderstorm') };
      break;
    }
    case 96:
    case 99: {
      data = {
        icon: CloudStorm,
        name: t('card.weatherDescriptions.thunderstormWithHail'),
      };
      break;
    }
    default: {
      data = { icon: QuestionMark, name: t('card.weatherDescriptions.unknown') };
    }
  }
  return (
    <Tooltip withinPortal withArrow label={data.name}>
      <Box>
        <data.icon size={50} />
      </Box>
    </Tooltip>
  );
}

export default function WeatherComponent(props: any) {
  // Get location from browser
  const { config } = useConfig();
  const [weather, setWeather] = useState({} as WeatherResponse);
  const cityInput: string =
    (config?.modules?.[WeatherModule.id]?.options?.location?.value as string) ?? 'Paris';
  const isFahrenheit: boolean =
    (config?.modules?.[WeatherModule.id]?.options?.freedomunit?.value as boolean) ?? false;

  useEffect(() => {
    axios
      .get(`https://geocoding-api.open-meteo.com/v1/search?name=${cityInput}`)
      .then((response) => {
        // Check if results exists
        const { latitude, longitude } = response.data.results
          ? response.data.results[0]
          : { latitude: 0, longitude: 0 };
        axios
          .get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Europe%2FLondon`
          )
          .then((res) => {
            setWeather(res.data);
          });
      });
  }, [cityInput]);
  if (!weather.current_weather) {
    return (
      <>
        <Skeleton height={40} width={100} mb="xl" />
        <Group noWrap>
          <Skeleton height={50} circle />
          <Group>
            <Skeleton height={25} width={70} mr="lg" />
            <Skeleton height={25} width={70} />
          </Group>
        </Group>
      </>
    );
  }
  function usePerferedUnit(value: number): string {
    return isFahrenheit ? `${(value * (9 / 5) + 32).toFixed(1)}°F` : `${value.toFixed(1)}°C`;
  }
  return (
    <Stack p="sm" spacing="xs">
      <Title>{usePerferedUnit(weather.current_weather.temperature)}</Title>
      <Group spacing={0}>
        <WeatherIcon code={weather.current_weather.weathercode} />
        <Space mx="sm" />
        <span>{usePerferedUnit(weather.daily.temperature_2m_max[0])}</span>
        <ArrowUpRight size={16} style={{ right: 15 }} />
        <Space mx="sm" />
        <span>{usePerferedUnit(weather.daily.temperature_2m_min[0])}</span>
        <ArrowDownRight size={16} />
      </Group>
    </Stack>
  );
}
