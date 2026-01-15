import { readFile } from "fs/promises";
import { join } from "path";
import type { StartedTestContainer } from "testcontainers";
import { GenericContainer, getContainerRuntimeClient, ImageName, Wait } from "testcontainers";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { createDb } from "@homarr/db/test";

import { NzbGetIntegration } from "../src";
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

const username = "nzbget";
const password = "tegbzn6789";
const IMAGE_NAME = "linuxserver/nzbget:latest";

describe("Nzbget integration", () => {
  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    await containerRuntimeClient.image.pull(ImageName.fromString(IMAGE_NAME));
  }, 100_000);

  test("Test connection should work", async () => {
    // Arrange
    const startedContainer = await createNzbGetContainer().start();
    const nzbGetIntegration = createNzbGetIntegration(startedContainer, username, password);

    // Act
    const result = await nzbGetIntegration.testConnectionAsync();

    // Assert
    expect(result.success).toBe(true);

    // Cleanup
    await startedContainer.stop();
  }, 30_000);

  test("Test connection should fail with wrong credentials", async () => {
    // Arrange
    const startedContainer = await createNzbGetContainer().start();
    const nzbGetIntegration = createNzbGetIntegration(startedContainer, "wrong-user", "wrong-password");

    // Act
    const result = await nzbGetIntegration.testConnectionAsync();

    // Assert
    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error).toBeInstanceOf(TestConnectionError);
    expect(result.error.type).toBe("authorization");

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("pauseQueueAsync should work", async () => {
    // Arrange
    const startedContainer = await createNzbGetContainer().start();
    const nzbGetIntegration = createNzbGetIntegration(startedContainer, username, password);

    // Acts
    const actAsync = async () => await nzbGetIntegration.pauseQueueAsync();
    const getAsync = async () => await nzbGetIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(actAsync()).resolves.not.toThrow();
    await expect(getAsync()).resolves.toMatchObject({ status: { paused: true } });

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("resumeQueueAsync should work", async () => {
    // Arrange
    const startedContainer = await createNzbGetContainer().start();
    const nzbGetIntegration = createNzbGetIntegration(startedContainer, username, password);
    await nzbGetIntegration.pauseQueueAsync();

    // Acts
    const actAsync = async () => await nzbGetIntegration.resumeQueueAsync();
    const getAsync = async () => await nzbGetIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(actAsync()).resolves.not.toThrow();
    await expect(getAsync()).resolves.toMatchObject({
      status: { paused: false },
    });

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("Items should be empty", async () => {
    // Arrange
    const startedContainer = await createNzbGetContainer().start();
    const nzbGetIntegration = createNzbGetIntegration(startedContainer, username, password);

    // Act
    const getAsync = async () => await nzbGetIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(getAsync()).resolves.not.toThrow();
    await expect(getAsync()).resolves.toMatchObject({
      items: [],
    });

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("1 Items should exist after adding one", async () => {
    // Arrange
    const startedContainer = await createNzbGetContainer().start();
    const nzbGetIntegration = createNzbGetIntegration(startedContainer, username, password);
    await nzbGetAddItemAsync(startedContainer, username, password, nzbGetIntegration);

    // Act
    const getAsync = async () => await nzbGetIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(getAsync()).resolves.not.toThrow();
    expect((await getAsync()).items).toHaveLength(1);

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("Delete item should result in empty items", async () => {
    // Arrange
    const startedContainer = await createNzbGetContainer().start();
    const nzbGetIntegration = createNzbGetIntegration(startedContainer, username, password);
    const item = await nzbGetAddItemAsync(startedContainer, username, password, nzbGetIntegration);

    // Act
    const actAsync = async () => await nzbGetIntegration.deleteItemAsync(item, true);

    // Assert
    await expect(actAsync()).resolves.not.toThrow();
    // NzbGet is slow and we wait for a few seconds before querying the items. Test was flaky without this.
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const result = await nzbGetIntegration.getClientJobsAndStatusAsync({ limit: 99 });
    expect(result.items).toHaveLength(0);

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds
});

const createNzbGetContainer = () => {
  return new GenericContainer(IMAGE_NAME)
    .withExposedPorts(6789)
    .withEnvironment({ PUID: "0", PGID: "0" })
    .withWaitStrategy(Wait.forLogMessage("[ls.io-init] done."));
};

const createNzbGetIntegration = (container: StartedTestContainer, username: string, password: string) => {
  return new NzbGetIntegration({
    id: "1",
    decryptedSecrets: [
      {
        kind: "username",
        value: username,
      },
      {
        kind: "password",
        value: password,
      },
    ],
    name: "NzbGet",
    url: `http://${container.getHost()}:${container.getMappedPort(6789)}`,
    externalUrl: null,
  });
};

const nzbGetAddItemAsync = async (
  container: StartedTestContainer,
  username: string,
  password: string,
  integration: NzbGetIntegration,
) => {
  const fileContent = await readFile(join(__dirname, "/volumes/usenet/test_download_100MB.nzb"), "base64");
  // Trigger scanning of the watch folder (Only available way to add an item except "append" which is too complex and unnecessary)
  await fetch(`http://${container.getHost()}:${container.getMappedPort(6789)}/${username}:${password}/jsonrpc`, {
    method: "POST",
    body: JSON.stringify({
      method: "append",
      params: [
        "/downloads/nzb/test_download_100MB.nzb", // NZBFilename
        fileContent, // Content
        "", // Category
        0, // Priority
        true, // AddToTop
        false, // Paused
        "random", // DupeKey
        1000, // DupeScore
        "all", // DupeMode
        [], // PPParameters
      ],
    }),
  });

  const {
    items: [item],
  } = await integration.getClientJobsAndStatusAsync({ limit: 99 });

  if (!item) {
    throw new Error("No item found");
  }

  return item;
};
