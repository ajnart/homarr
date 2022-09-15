import { Field, ObjectType } from '@nestjs/graphql';
import { UsenetQueueItem } from './usenetQueueItem.model';

@ObjectType()
export class UsenetQueue {
  @Field(() => [UsenetQueueItem])
  items: UsenetQueueItem[];

  @Field()
  total: number;
}
