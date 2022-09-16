import { Field, InputType } from '@nestjs/graphql';
import { ServiceType } from './serviceType.enum';

@InputType()
export class ServiceInput {
  @Field()
  name: string;

  @Field(() => ServiceType)
  type: ServiceType;

  @Field()
  icon: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  apiKey?: string;
}
