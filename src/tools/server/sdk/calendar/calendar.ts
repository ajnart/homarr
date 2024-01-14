import { z } from 'zod';
import { calendarEvents } from '~/widgets/calendar/type';
import { ConfigAppType } from '~/types/app';

export abstract class Calendar {
  async getEventsByMonth(app: ConfigAppType, month: number, year: number) {
    const start = new Date(year, month - 1, 1); // First day of month
    const end = new Date(year, month, 0); // Last day of month

    return await this.getEvents(app, start, end);
  }

  abstract getEvents(app: ConfigAppType, start: Date, end: Date): Promise<z.infer<typeof calendarEvents>>;
}