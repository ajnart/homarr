import Docker from 'dockerode';

export default class DockerSingleton extends Docker {
  private static dockerInstance: DockerSingleton;

  private constructor() {
    super();
  }

  public static getInstance(): DockerSingleton {
    if (!DockerSingleton.dockerInstance) {
      DockerSingleton.dockerInstance = new Docker({
        // If env variable DOCKER_HOST is not set, it will use the default socket
        ...(process.env.DOCKER_HOST && { host: process.env.DOCKER_HOST }),
        // Same thing for docker port
        ...(process.env.DOCKER_PORT && { port: process.env.DOCKER_PORT }),
      });
    }
    return DockerSingleton.dockerInstance;
  }
}
