import { Field, ObjectType } from '@nestjs/graphql';
import { Modules } from './modules.model';
import { Service } from './service.model';
import { Settings } from './settings.model';

@ObjectType()
export class Config {
  @Field()
  name: string;

  @Field(() => [Service])
  services: Service[];

  @Field(() => Settings)
  settings: Settings;

  @Field(() => Modules)
  modules: Modules;
}
