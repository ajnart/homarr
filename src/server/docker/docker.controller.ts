import { Controller, Get, Param, Query } from '@nestjs/common';
import { DockerService } from './docker.service';

@Controller('/docker')
export class DockerController {
  constructor(private dockerService: DockerService) {}

  @Get('/containers')
  async containers() {
    return this.dockerService.listContainers({ all: true });
  }

  @Get('/containers/:id')
  async container(
    @Param('id') id: string,
    @Query('action') action: 'start' | 'stop' | 'restart' | 'remove'
  ) {
    const container = this.dockerService.getContainer(id);
    const startAction = async () => {
      switch (action) {
        case 'remove':
          return container.remove();
        case 'start':
          return container.start();
        case 'stop':
          return container.stop();
        case 'restart':
          return container.restart();
        default:
          return Promise;
      }
    };

    await startAction();
    return {
      message: `Container ${id} ${action}ed`,
    };
  }
}
