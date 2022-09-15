import { Field, ObjectType } from '@nestjs/graphql';
import { DockerPort } from './dockerPort.model';
import { DockerStatus } from './dockerStatus.model';

@ObjectType()
export class DockerContainer {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  image: string;

  @Field(() => DockerStatus)
  status: DockerStatus;

  @Field(() => [DockerPort])
  ports: DockerPort[];
}
