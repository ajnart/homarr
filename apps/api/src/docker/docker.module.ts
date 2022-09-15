import { Module } from '@nestjs/common';
import { DockerResolver } from './docker.resolver';
import { DockerService } from './docker.service';

@Module({
  providers: [DockerService, DockerResolver],
})
export class DockerModule {}
