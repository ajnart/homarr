import { Field, ObjectType } from '@nestjs/graphql';
import { UsenetQueueStatus } from './usenetQueueStatus.enum';

@ObjectType()
export class UsenetQueueItem {
  @Field()
  name: string;

  @Field()
  progress: number;

  /**
   * Size in bytes
   */
  @Field()
  size: number;

  @Field()
  id: string;

  @Field((type) => UsenetQueueStatus)
  state: UsenetQueueStatus;

  @Field()
  eta: number;
}
