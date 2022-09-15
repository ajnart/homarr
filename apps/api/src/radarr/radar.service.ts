import { flatten, Inject, Injectable } from '@nestjs/common';
import { MovieCalendarItem } from '../calendar/models/movieCalendarItem.model';
import { MediaCoverTypes } from './api/data-contracts';
import { RadarrClient } from './radarr.client';
import { RADARR_CLIENT } from './radarr.const';

@Injectable()
export class RadarrService {
  constructor(@Inject(RADARR_CLIENT) private radarrClients: RadarrClient[]) {}

  public async getCalendar(opts: { startDate: Date; endDate: Date }): Promise<MovieCalendarItem[]> {
    const items = await Promise.all(
      this.radarrClients.map(async (client) => {
        const response = await client.getCalendar(opts);

        return response.map<MovieCalendarItem>((item) => ({
          genres: item.genres || [],
          inCinemasDate: new Date(item.inCinemas!),
          digitalDate: new Date(item.digitalRelease!),
          imdbId: item.imdbId || '',
          movieTitle: item.title || '',
          poster: item.images?.find((img) => img.coverType === MediaCoverTypes.Poster)?.url || '',
          overview: item.overview || '',
          voteAverage: item.ratings.tmdb.value,
        }));
      })
    );

    return flatten(items);
  }
}
