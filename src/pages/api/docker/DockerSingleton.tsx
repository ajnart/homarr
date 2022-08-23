import Docker from 'dockerode';

export default class DockerSingleton extends Docker {
  private static dockerInstance: DockerSingleton;

  private constructor() {
    super({
      host: '192.168.1.56',
      port: 2376,
    });
  }

  public static getInstance(): DockerSingleton {
    if (!this.dockerInstance) {
      this.dockerInstance = new this();
    }
    return this.dockerInstance;
  }
}
