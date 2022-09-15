import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DockerContainer } from './models/docker.model';
import { DockerService } from './docker.service';
import { DockerAction } from './models/dockerAction.enum';

@Resolver(() => DockerContainer)
export class DockerResolver {
  constructor(private dockerService: DockerService) {}

  @Query(() => [DockerContainer])
  async containers(): Promise<DockerContainer[]> {
    return this.dockerService.getContainers();
  }

  @Mutation(() => [DockerContainer])
  async updateContainers(
    @Args('ids', { type: () => [String] }) ids: string[],
    @Args('action', { type: () => DockerAction }) action: DockerAction
  ): Promise<DockerContainer[]> {
    return Promise.all(ids.map(async (id) => this.dockerService.updateContainer(id, action)));
  }
}
