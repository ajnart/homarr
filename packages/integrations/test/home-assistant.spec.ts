import { join } from "path";
import type { StartedTestContainer } from "testcontainers";
import { GenericContainer, getContainerRuntimeClient, ImageName, Wait } from "testcontainers";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { createDb } from "@homarr/db/test";

import { HomeAssistantIntegration } from "../src";
import { TestConnectionError } from "../src/base/test-connection/test-connection-error";

vi.mock("@homarr/db", async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importActual<typeof import("@homarr/db")>();
  return {
    ...actual,
    db: createDb(),
  };
});

vi.mock("@homarr/core/infrastructure/certificates", async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importActual<typeof import("@homarr/core/infrastructure/certificates")>();
  return {
    ...actual,
    getTrustedCertificateHostnamesAsync: vi.fn().mockImplementation(() => {
      return Promise.resolve([]);
    }),
  };
});

const DEFAULT_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkNjQwY2VjNDFjOGU0NGM5YmRlNWQ4ZmFjMjUzYWViZiIsImlhdCI6MTcxODQ3MTE1MSwiZXhwIjoyMDMzODMxMTUxfQ.uQCZ5FZTokipa6N27DtFhLHkwYEXU1LZr0fsVTryL2Q";
const IMAGE_NAME = "ghcr.io/home-assistant/home-assistant:stable";

describe("Home Assistant integration", () => {
  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    await containerRuntimeClient.image.pull(ImageName.fromString(IMAGE_NAME));
  }, 100_000);

  test("Test connection should work", async () => {
    // Arrange
    const startedContainer = await prepareHomeAssistantContainerAsync();
    const homeAssistantIntegration = createHomeAssistantIntegration(startedContainer);

    // Act
    const result = await homeAssistantIntegration.testConnectionAsync();

    // Assert
    expect(result.success).toBe(true);

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds
  test("Test connection should fail with wrong credentials", async () => {
    // Arrange
    const startedContainer = await prepareHomeAssistantContainerAsync();
    const homeAssistantIntegration = createHomeAssistantIntegration(startedContainer, "wrong-api-key");

    // Act
    const result = await homeAssistantIntegration.testConnectionAsync();

    // Assert
    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toBeInstanceOf(TestConnectionError);
    expect(result.error.type).toBe("authorization");

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds
});

const prepareHomeAssistantContainerAsync = async () => {
  const homeAssistantContainer = createHomeAssistantContainer();
  const startedContainer = await homeAssistantContainer.start();
  await startedContainer.exec(["unzip", "-o", "/tmp/config.zip", "-d", "/config"]);
  await startedContainer.restart();
  return startedContainer;
};

const createHomeAssistantContainer = () => {
  return (
    new GenericContainer(IMAGE_NAME)
      .withCopyFilesToContainer([
        {
          source: join(__dirname, "/volumes/home-assistant-config.zip"),
          target: "/tmp/config.zip",
        },
      ])
      .withPrivilegedMode()
      .withExposedPorts(8123)
      // This has to be a page that is not redirected (or a status code has to be defined withStatusCode(statusCode))
      .withWaitStrategy(Wait.forHttp("/onboarding.html", 8123))
  );
};

const createHomeAssistantIntegration = (container: StartedTestContainer, apiKeyOverride?: string) => {
  console.log("Creating Home Assistant integration...");
  return new HomeAssistantIntegration({
    id: "1",
    decryptedSecrets: [
      {
        kind: "apiKey",
        value: apiKeyOverride ?? DEFAULT_API_KEY,
      },
    ],
    name: "Home assistant",
    url: `http://${container.getHost()}:${container.getMappedPort(8123)}`,
    externalUrl: null,
  });
};
