import { Injectable } from '@nestjs/common';
import Docker from 'dockerode';
import { DockerContainer, DockerStatus } from './docker.model';

@Injectable()
export class DockerService {
  private readonly dockerClient: Docker = new Docker();

  async getContainers(): Promise<DockerContainer[]> {
    return (await this.dockerClient.listContainers({ all: true })).map<DockerContainer>((cont) => ({
      id: cont.Id,
      name: cont.Names[0].replace('/', ''),
      image: cont.Image,
      ports: cont.Ports.map((p) => ({
        private: p.PrivatePort,
        public: p.PublicPort,
      })),
      status: cont.State as DockerStatus,
    }));
  }
}
