import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrWeatherDefinition = CommonOldmarrWidgetDefinition<
  "weather",
  {
    displayInFahrenheit: boolean;
    displayCityName: boolean;
    displayWeekly: boolean;
    forecastDays: number;
    location: {
      name: string;
      latitude: number;
      longitude: number;
    };
    dateFormat:
      | "hide"
      | "dddd, MMMM D"
      | "dddd, D MMMM"
      | "MMM D"
      | "D MMM"
      | "DD/MM/YYYY"
      | "MM/DD/YYYY"
      | "DD/MM"
      | "MM/DD";
  }
>;
