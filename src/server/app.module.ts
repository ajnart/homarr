import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './configs/config.module';
import { DockerModule } from './docker/docker.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [ConfigModule, DockerModule, SearchModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
