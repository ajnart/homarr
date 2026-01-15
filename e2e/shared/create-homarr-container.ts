import { GenericContainer, Wait } from "testcontainers";
import { Environment } from "testcontainers/build/types";

export const createHomarrContainer = (
  options: {
    environment?: Environment;
    mounts?: {
      "/appdata"?: string;
      "/var/run/docker.sock"?: string;
    };
  } = {},
) => {
  if (!process.env.CI) {
    throw new Error("This test should only be run in CI or with a homarr image named 'homarr-e2e'");
  }

  const container = new GenericContainer("homarr-e2e")
    .withExposedPorts(7575)
    .withEnvironment({
      ...options.environment,
      SECRET_ENCRYPTION_KEY: "0".repeat(64),
    })
    .withBindMounts(
      Object.entries(options.mounts ?? {})
        .filter((item) => item?.[0] !== undefined)
        .map(([container, local]) => ({
          source: local,
          target: container,
        })),
    )
    .withWaitStrategy(Wait.forHttp("/api/health/ready", 7575))
    .withExtraHosts([
      {
        // This enabled the usage of host.docker.internal as hostname in the container
        host: "host.docker.internal",
        ipAddress: "host-gateway",
      },
    ]);

  return withLogs(container);
};

export const withLogs = (container: GenericContainer) => {
  container.withLogConsumer((stream) =>
    stream
      .on("data", (line) => console.log(line))
      .on("err", (line) => console.error(line))
      .on("end", () => console.log("Stream closed")),
  );
  return container;
};
