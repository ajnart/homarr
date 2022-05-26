import { Card } from '@mantine/core';
import { MediaDisplay } from '../calendar/MediaDisplay';

export interface OverseerrMedia {
  id: number;
  firstAirDate: string;
  genreIds: number[];
  mediaType: string;
  name: string;
  originCountry: string[];
  originalLanguage: string;
  originalName: string;
  overview: string;
  popularity: number;
  voteAverage: number;
  voteCount: number;
  backdropPath: string;
  posterPath: string;
  mediaInfo: MediaInfo;
}

export interface MediaInfo {
  downloadStatus: any[];
  downloadStatus4k: any[];
  id: number;
  mediaType: string;
  tmdbId: number;
  tvdbId: number;
  imdbId: null;
  status: number;
  status4k: number;
  createdAt: string;
  updatedAt: string;
  lastSeasonChange: string;
  mediaAddedAt: string;
  serviceId: number;
  serviceId4k: null;
  externalServiceId: number;
  externalServiceId4k: null;
  externalServiceSlug: string;
  externalServiceSlug4k: null;
  ratingKey: string;
  ratingKey4k: null;
  seasons: Season[];
  plexUrl: string;
  serviceUrl: string;
}

export interface Season {
  id: number;
  seasonNumber: number;
  status: number;
  status4k: number;
  createdAt: string;
  updatedAt: string;
}

export default function OverseerrMediaDisplay(props: any) {
  const { media }: { media: OverseerrMedia } = props;
  return (
    <Card shadow="xl" withBorder>
      <MediaDisplay
        style={{
          width: 600,
        }}
        media={{
          title: media.name,
          seasonNumber: media.mediaInfo.seasons.length + 1,
          overview: media.overview,
          plexUrl: media.mediaInfo.plexUrl,
          imdbId: media.mediaInfo.imdbId,
          poster: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${media.posterPath}`,
          genres: [`score: ${media.voteAverage}/10`],
        }}
      />
    </Card>
  );
}
