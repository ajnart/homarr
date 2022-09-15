import { Module } from '@nestjs/common';
import { DockerController } from './docker.controller';
import { DockerResolver } from './docker.resolve';
import { DockerService } from './docker.service';

@Module({
  controllers: [DockerController],
  providers: [DockerService, DockerResolver],
})
export class DockerModule {}
