import { RadarrApi } from './api/Api';

interface RadarrClientOptions {
  apiUrl: string;
  apiKey: string;
}

export class RadarrClient {
  private apiClient: RadarrApi;
  constructor(private readonly options: RadarrClientOptions) {
    this.apiClient = new RadarrApi({
      baseURL: this.options.apiUrl,
      params: {
        apiKey: this.options.apiKey,
      },
    });
  }

  public async getCalendar(opts: { startDate: Date; endDate: Date }) {
    const response = await this.apiClient.v3CalendarList({
      start: opts.startDate.toISOString(),
      end: opts.endDate.toISOString(),
    });

    return response.data;
  }
}
