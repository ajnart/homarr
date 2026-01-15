import type { CalendarEvent } from "./calendar-types";

export interface ICalendarIntegration {
  getCalendarEventsAsync(start: Date, end: Date, includeUnmonitored: boolean): Promise<CalendarEvent[]>;
}
