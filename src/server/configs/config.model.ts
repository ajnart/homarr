import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Config {
  @Field()
  name: string;

  @Field(() => [Service])
  services: Service[];
}

@ObjectType()
export class Service {
  @Field()
  name: string;
  @Field()
  id: string;
  @Field()
  type: string;
  @Field()
  icon: string;
  @Field()
  url: string;
}
