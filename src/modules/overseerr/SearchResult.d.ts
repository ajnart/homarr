export interface SearchResult {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Result[];
}

export interface Result {
  id: number;
  mediaType: MediaType;
  adult?: boolean;
  genreIds: number[];
  originalLanguage: OriginalLanguage;
  originalTitle?: string;
  overview: string;
  popularity: number;
  releaseDate?: Date;
  title?: string;
  video?: boolean;
  voteAverage: number;
  voteCount: number;
  backdropPath: null | string;
  posterPath: string;
  mediaInfo?: MediaInfo;
  firstAirDate?: Date;
  name?: string;
  originCountry?: string[];
  originalName?: string;
}

export interface MediaInfo {
  downloadStatus: any[];
  downloadStatus4k: any[];
  id: number;
  mediaType: MediaType;
  tmdbId: number;
  tvdbId: null;
  imdbId: null;
  status: number;
  status4k: number;
  createdAt: Date;
  updatedAt: Date;
  lastSeasonChange: Date;
  mediaAddedAt: Date;
  serviceId: number;
  serviceId4k: null;
  externalServiceId: number;
  externalServiceId4k: null;
  externalServiceSlug: string;
  externalServiceSlug4k: null;
  ratingKey: string;
  ratingKey4k: null;
  seasons: any[];
  plexUrl: string;
  serviceUrl: string;
  mediaUrl?: string;
}

export type MediaType = 'movie' | 'tv';

export enum OriginalLanguage {
  En = 'en',
}
