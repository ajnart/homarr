import Docker from 'dockerode';
import { env } from '~/env';

export default class DockerSingleton extends Docker {
  private static dockerInstance: DockerSingleton;

  private constructor() {
    super();
  }

  public static getInstance(): DockerSingleton {
    if (!DockerSingleton.dockerInstance) {
      DockerSingleton.dockerInstance = new Docker({
        host: env.DOCKER_HOST,
        port: env.DOCKER_PORT,
      });
    }
    return DockerSingleton.dockerInstance;
  }
}
