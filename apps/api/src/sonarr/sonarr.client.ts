import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';
import { SonarrCalendarItem } from './sonarr.types';

interface SonarrClientOptions {
  apiUrl: string;
  apiKey: string;
}

export class SonarrClient {
  private readonly apiClient: AxiosInstance;

  constructor(private readonly options: SonarrClientOptions) {
    this.apiClient = axios.create({
      baseURL: this.options.apiUrl,
      params: {
        apiKey: this.options.apiKey,
      },
    });
  }

  public async getCalendar(): Promise<SonarrCalendarItem[]> {
    const response = await this.apiClient.get('/api/calendar', {
      params: {
        start: dayjs().startOf('month').toISOString(),
        end: dayjs().endOf('month').add(1, 'month').toISOString(),
      },
    });

    return response.data;
  }
}
