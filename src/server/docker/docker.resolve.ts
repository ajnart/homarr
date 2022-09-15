import { Query, Resolver } from '@nestjs/graphql';
import { DockerContainer } from './docker.model';
import { DockerService } from './docker.service';

@Resolver(() => DockerContainer)
export class DockerResolver {
  constructor(private dockerService: DockerService) {}

  @Query(() => [DockerContainer])
  async containers(): Promise<DockerContainer[]> {
    return this.dockerService.getContainers();
  }
}
