import Docker from 'dockerode';

export default class DockerSingleton extends Docker {
  private static dockerInstance: DockerSingleton;

  private constructor() {
    super({
      host: '192.168.1.56',
      port: 2377,
    });
  }

  public static getInstance(): DockerSingleton {
    if (!DockerSingleton.dockerInstance) {
      DockerSingleton.dockerInstance = new DockerSingleton();
    }
    return DockerSingleton.dockerInstance;
  }
}
