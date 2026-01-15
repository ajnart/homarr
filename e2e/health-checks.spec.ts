import { describe, expect, test } from "vitest";

import { createHomarrContainer } from "./shared/create-homarr-container";
import { createRedisContainer } from "./shared/redis-container";

describe("Health checks", () => {
  test("ready and live should return 200 OK with normal image and no extra configuration", async () => {
    // Arrange
    const homarrContainer = await createHomarrContainer().start();

    // Act
    const readyResponse = await fetch(`http://localhost:${homarrContainer.getMappedPort(7575)}/api/health/ready`);
    const liveResponse = await fetch(`http://localhost:${homarrContainer.getMappedPort(7575)}/api/health/live`);

    // Assert
    expect(readyResponse.status).toBe(200);
    expect(liveResponse.status).toBe(200);
  }, 20_000);

  test("ready and live should return 200 OK with external redis", async () => {
    // Arrange
    const redisContainer = await createRedisContainer().start();
    const homarrContainer = await createHomarrContainer({
      environment: {
        REDIS_IS_EXTERNAL: "true",
        REDIS_HOST: "host.docker.internal",
        REDIS_PORT: redisContainer.getMappedPort(6379).toString(),
        REDIS_PASSWORD: redisContainer.getPassword(),
      },
    }).start();

    // Act
    const readyResponse = await fetch(`http://localhost:${homarrContainer.getMappedPort(7575)}/api/health/ready`);
    const liveResponse = await fetch(`http://localhost:${homarrContainer.getMappedPort(7575)}/api/health/live`);

    // Assert
    expect(
      readyResponse.status,
      `Expected ready to return OK statusCode=${readyResponse.status} content=${await readyResponse.text()}`,
    ).toBe(200);
    expect(
      liveResponse.status,
      `Expected live to return OK statusCode=${liveResponse.status} content=${await liveResponse.text()}`,
    ).toBe(200);
  }, 20_000);
});
