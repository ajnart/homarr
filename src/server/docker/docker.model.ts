import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class DockerContainer {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  image: string;

  @Field()
  status: DockerStatus;

  @Field(() => [DockerPort])
  ports: DockerPort[];
}

@ObjectType()
export class DockerPort {
  @Field()
  private: number;

  @Field()
  public: number;
}

export enum DockerStatus {
  Running = 'running',
  Created = 'created',
  Exited = 'exited',
  Unknown = 'unknown',
}

registerEnumType(DockerStatus, { name: 'DockerStatus' });
