import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class UsenetHistory {
  @Field(() => [UsenetHistoryItem])
  items: UsenetHistoryItem[];

  @Field()
  total: number;
}

@ObjectType()
export class UsenetQueue {
  @Field(() => [UsenetQueueItem])
  items: UsenetQueueItem[];

  @Field()
  total: number;
}

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

  @Field()
  state: UsenetQueueStatus;

  @Field()
  eta: number;
}

enum UsenetQueueStatus {
  Paused = 'paused',
  Downloading = 'downloading',
  Queued = 'queued',
}

registerEnumType(UsenetQueueStatus, { name: 'UsenetQueueStatus' });

@ObjectType()
export class UsenetHistoryItem {
  @Field()
  name: string;

  /**
   * Size in bytes
   */
  @Field()
  size: number;

  @Field()
  id: string;

  @Field()
  time: number;
}
