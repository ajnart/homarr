import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DockerPort {
  @Field()
  private: number;

  @Field()
  public: number;
}
