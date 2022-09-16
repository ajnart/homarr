import { Injectable } from '@nestjs/common';
import Docker from 'dockerode';
import { DockerContainer } from './models/docker.model';
import { DockerAction } from './models/dockerAction.enum';
import { DockerStatus } from './models/dockerStatus.model';

@Injectable()
export class DockerService {
  private readonly dockerClient: Docker = new Docker();

  async getContainers(): Promise<DockerContainer[]> {
    return (await this.dockerClient.listContainers({ all: true })).map(this.mapContainerInfo);
  }

  async updateContainer(id: string, action: DockerAction): Promise<DockerContainer> {
    const container = this.dockerClient.getContainer(id);
    const startAction = async () => {
      switch (action) {
        case DockerAction.Remove:
          await container.remove();
          break;
        case DockerAction.Start:
          await container.start();
          break;
        case DockerAction.Stop:
          await container.stop();
          break;
        case DockerAction.Restart:
          await container.restart();
          break;
      }
    };

    try {
      await startAction();
    } catch (err) {
      console.error('Error updating container', err);
    }

    const containers = await this.dockerClient.listContainers({
      filters: {
        id: [id],
        status: ['created', 'restarting', 'running', 'removing', 'paused', 'exited', 'dead'],
      },
    });
    return this.mapContainerInfo(containers[0]);
  }

  private mapContainerInfo(container: Docker.ContainerInfo): DockerContainer {
    return {
      id: container.Id,
      name: container.Names[0].replace('/', ''),
      image: container.Image,
      ports: container.Ports.map((p) => ({
        private: p.PrivatePort,
        public: p.PublicPort,
      })),
      status: container.State as DockerStatus,
    };
  }
}
