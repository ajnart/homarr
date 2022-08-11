// To parse this data:
//
//   import { Convert, WeatherResponse } from "./file";
//
//   const weatherResponse = Convert.toWeatherResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface WeatherResponse {
  current_weather: CurrentWeather;
  utc_offset_seconds: number;
  latitude: number;
  elevation: number;
  longitude: number;
  generationtime_ms: number;
  daily_units: DailyUnits;
  daily: Daily;
}

export interface CurrentWeather {
  winddirection: number;
  windspeed: number;
  time: string;
  weathercode: number;
  temperature: number;
}

export interface Daily {
  temperature_2m_max: number[];
  time: Date[];
  temperature_2m_min: number[];
  weathercode: number[];
}

export interface DailyUnits {
  temperature_2m_max: string;
  temperature_2m_min: string;
  time: string;
  weathercode: string;
}
