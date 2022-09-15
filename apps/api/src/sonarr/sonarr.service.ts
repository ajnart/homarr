import { flatten, Inject, Injectable } from '@nestjs/common';
import { TvCalendarItem } from '../calendar/models/tvCalendarItem.model';
import { SonarrClient } from './sonarr.client';
import { SONARR_CLIENT } from './sonarr.const';
import { CoverType } from './sonarr.types';

@Injectable()
export class SonarrService {
  constructor(@Inject(SONARR_CLIENT) private sonarrClients: SonarrClient[]) {}

  public async getCalendar(): Promise<TvCalendarItem[]> {
    const items = await Promise.all(
      this.sonarrClients.map(async (client) => {
        const response = await client.getCalendar();

        return response.map<TvCalendarItem>((item) => ({
          airDate: new Date(item.airDateUtc),
          episodeNumber: item.episodeNumber,
          episodeTitle: item.title,
          imdbId: item.series.imdbId,
          seasonNumber: item.seasonNumber,
          seriesTitle: item.series.title,
          tvDbId: item.series.tvdbId,
          poster: item.series.images.find((img) => img.coverType === CoverType.Poster)?.url || '',
          genres: item.series.genres,
          overview: item.overview || '',
        }));
      })
    );

    return flatten(items);
  }
}
