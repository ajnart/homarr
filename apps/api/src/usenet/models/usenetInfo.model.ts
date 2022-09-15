import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UsenetInfo {
  @Field()
  paused: boolean;

  /**
   * In mb
   */
  @Field()
  sizeLeft: number;

  /**
   * In mb
   */
  @Field()
  speed: number;

  /**
   * In seconds
   */
  @Field()
  eta: number;
}
