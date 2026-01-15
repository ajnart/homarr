import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrCalendarDefinition = CommonOldmarrWidgetDefinition<
  "calendar",
  {
    hideWeekDays: boolean;
    showUnmonitored: boolean;
    radarrReleaseType: "inCinemas" | "physicalRelease" | "digitalRelease";
    fontSize: "xs" | "sm" | "md" | "lg" | "xl";
  }
>;
