import Docker from 'dockerode';

export default class DockerSingleton extends Docker {
  private static dockerInstance: DockerSingleton;

  private constructor() {
    super();
  }

  public static getInstance(): DockerSingleton {
    if (!DockerSingleton.dockerInstance) {
      DockerSingleton.dockerInstance = new DockerSingleton();
    }
    return DockerSingleton.dockerInstance;
  }
}
