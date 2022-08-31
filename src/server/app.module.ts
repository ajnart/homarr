import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { join } from 'path';
import { AppController } from './app.controller';
import { CalendarModule } from './calendar/calendar.module';
import { ConfigModule } from './configs/config.module';
import { DockerModule } from './docker/docker.module';
import { RadarrModule } from './radarr/radarr.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule,
    DockerModule,
    SearchModule,
    RadarrModule,
    CalendarModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
