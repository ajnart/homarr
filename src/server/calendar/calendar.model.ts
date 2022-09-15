import { createUnionType, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MovieCalendarItem {
  @Field()
  movieTitle: string;

  @Field()
  inCinemasDate: Date;

  @Field()
  digitalDate: Date;

  @Field()
  imdbId: string;

  @Field()
  poster: string;

  @Field((type) => [String])
  genres: string[];

  @Field()
  overview: string;
}

@ObjectType()
export class TvCalendarItem {
  @Field()
  seriesTitle: string;

  @Field()
  episodeTitle: string;

  @Field()
  overview: string;

  @Field()
  airDate: Date;

  @Field()
  seasonNumber: number;

  @Field()
  episodeNumber: number;

  @Field()
  tvDbId: string;

  @Field()
  imdbId: string;

  @Field()
  poster: string;

  @Field((type) => [String])
  genres: string[];
}

export const CalendarItems = createUnionType({
  name: 'CalendarItem',
  types: () => [MovieCalendarItem, TvCalendarItem] as const,
  resolveType(item: MovieCalendarItem | TvCalendarItem) {
    if ((item as MovieCalendarItem).movieTitle) {
      return MovieCalendarItem;
    }

    if ((item as TvCalendarItem).seriesTitle) {
      return TvCalendarItem;
    }

    return null;
  },
});
