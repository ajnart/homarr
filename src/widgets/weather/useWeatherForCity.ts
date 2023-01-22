import { useQuery } from '@tanstack/react-query';
import { WeatherResponse } from './types';

/**
 * Requests the weather of the specified city
 * @param cityName name of the city where the weather should be requested
 * @returns weather of specified city
 */
export const useWeatherForCity = (cityName: string) => {
  const {
    data: city,
    isLoading,
    isError,
  } = useQuery({ queryKey: ['weatherCity', { cityName }], queryFn: () => fetchCity(cityName) });
  const weatherQuery = useQuery({
    queryKey: ['weather', { cityName }],
    queryFn: () => fetchWeather(city?.results[0]),
    enabled: !!city,
    refetchInterval: 1000 * 60 * 5, // requests the weather every 5 minutes
  });

  return {
    ...weatherQuery,
    isLoading: weatherQuery.isLoading || isLoading,
    isError: weatherQuery.isError || isError,
  };
};

/**
 * Requests the coordinates of a city
 * @param cityName name of city
 * @returns list with all coordinates for citites with specified name
 */
const fetchCity = async (cityName: string) => {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`);
  return (await res.json()) as { results: Coordinates[] };
};

/**
 * Requests the weather of specific coordinates
 * @param coordinates of the location the weather should be fetched
 * @returns weather of specified coordinates
 */
const fetchWeather = async (coordinates?: Coordinates) => {
  if (!coordinates) return;
  const { longitude, latitude } = coordinates;
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Europe%2FLondon`
  );
  // eslint-disable-next-line consistent-return
  return (await res.json()) as WeatherResponse;
};

type Coordinates = { latitude: number; longitude: number };
