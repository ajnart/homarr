import { Field, ObjectType } from '@nestjs/graphql';
import { CalendarConfig } from '../../calendar/models/calendarConfig.model';
import { DockerConfig } from '../../docker/models/dockerConfig.model';
import { UsenetConfig } from '../../usenet/usenetConfig.model';

@ObjectType()
export class Modules {
  @Field({ nullable: true })
  usenet?: UsenetConfig;

  @Field({ nullable: true })
  docker?: DockerConfig;

  @Field({ nullable: true })
  calendar?: CalendarConfig;
}
