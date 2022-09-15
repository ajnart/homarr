import { Field, ObjectType } from '@nestjs/graphql';

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

  @Field({ nullable: true })
  voteAverage?: number;
}
