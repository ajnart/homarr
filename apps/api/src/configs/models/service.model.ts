import { Field, ObjectType } from '@nestjs/graphql';
import { ServiceType } from './serviceType.enum';

@ObjectType()
export class Service {
  @Field()
  name: string;

  @Field()
  id: string;

  @Field(() => ServiceType)
  type: ServiceType;

  @Field()
  icon: string;

  @Field()
  url: string;

  @Field()
  apiKey?: string;
}
