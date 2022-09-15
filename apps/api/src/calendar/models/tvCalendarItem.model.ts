import { Field, ObjectType } from '@nestjs/graphql';

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
