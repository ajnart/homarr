import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConfigModule {
  @Field({ nullable: true })
  title?: string;

  @Field()
  enabled: boolean;
}
