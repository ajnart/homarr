import Docker from "dockerode";

import { env } from "./env";

export interface DockerInstance {
  host: string;
  instance: Docker;
}

export class DockerSingleton {
  private static instances: DockerInstance[] | null = null;

  private createInstances() {
    const hostVariable = env.DOCKER_HOSTNAMES;
    const portVariable = env.DOCKER_PORTS;
    if (hostVariable === undefined || portVariable === undefined) {
      return [{ host: "socket", instance: new Docker() }];
    }
    const hostnames = hostVariable.split(",");
    const ports = portVariable.split(",");

    if (hostnames.length !== ports.length) {
      throw new Error("The number of hosts and ports must match");
    }

    return hostnames.map((host, i) => {
      // Check above ensures that ports[i] is not undefined
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const port = ports[i]!;

      return {
        host: `${host}:${port}`,
        instance: new Docker({
          host,
          port: parseInt(port, 10),
        }),
      };
    });
  }

  public static findInstance(host: string): DockerInstance | undefined {
    return this.instances?.find((instance) => instance.host === host);
  }

  public static getInstances(): DockerInstance[] {
    if (this.instances) {
      return this.instances;
    }

    this.instances = new DockerSingleton().createInstances();
    return this.instances;
  }
}
