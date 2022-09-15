import { Field, ObjectType } from '@nestjs/graphql';
import { MantineTheme } from '@mantine/core';

@ObjectType()
export class Settings {
  @Field()
  searchUrl: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  favicon?: string;

  @Field(() => String, { nullable: true })
  primaryColor?: MantineTheme['primaryColor'];

  @Field(() => String, { nullable: true })
  secondaryColor?: MantineTheme['primaryColor'];

  @Field(() => String, { nullable: true })
  primaryShade?: MantineTheme['primaryShade'];

  @Field({ nullable: true })
  background?: string;

  @Field({ nullable: true })
  customCSS?: string;

  @Field({ nullable: true })
  appOpacity?: number;

  @Field({ nullable: true })
  widgetPosition?: string;

  @Field({ nullable: true })
  appCardWidth?: number;
}
