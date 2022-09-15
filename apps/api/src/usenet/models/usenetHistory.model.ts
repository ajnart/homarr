import { Field, ObjectType } from '@nestjs/graphql';
import { UsenetHistoryItem } from './usenetHistoryItem.model';

@ObjectType()
export class UsenetHistory {
  @Field(() => [UsenetHistoryItem])
  items: UsenetHistoryItem[];

  @Field()
  total: number;
}
