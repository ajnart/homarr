import type { StartedTestContainer } from "testcontainers";
import { GenericContainer, getContainerRuntimeClient, ImageName, Wait } from "testcontainers";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { createDb } from "@homarr/db/test";

import { Aria2Integration } from "../src";

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

const API_KEY = "ARIA2_API_KEY";
const IMAGE_NAME = "hurlenko/aria2-ariang:latest";

describe("Aria2 integration", () => {
  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    await containerRuntimeClient.image.pull(ImageName.fromString(IMAGE_NAME));
  }, 100_000);

  test("Test connection should work", async () => {
    // Arrange
    const startedContainer = await createAria2Container().start();
    const aria2Integration = createAria2Intergration(startedContainer, API_KEY);

    // Act
    const result = await aria2Integration.testConnectionAsync();

    // Assert
    expect(result.success).toBe(true);

    // Cleanup
    await startedContainer.stop();
  }, 30_000);

  test("pauseQueueAsync should work", async () => {
    // Arrange
    const startedContainer = await createAria2Container().start();
    const aria2Integration = createAria2Intergration(startedContainer, API_KEY);

    // Acts
    const actAsync = async () => await aria2Integration.pauseQueueAsync();
    const getAsync = async () => await aria2Integration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(actAsync()).resolves.not.toThrow();
    await expect(getAsync()).resolves.toMatchObject({ status: { paused: true } });

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("Items should be empty", async () => {
    // Arrange
    const startedContainer = await createAria2Container().start();
    const aria2Integration = createAria2Intergration(startedContainer, API_KEY);

    // Act
    const getAsync = async () => await aria2Integration.getClientJobsAndStatusAsync({ limit: 99 });

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
    const startedContainer = await createAria2Container().start();
    const aria2Integration = createAria2Intergration(startedContainer, API_KEY);
    await aria2AddItemAsync(startedContainer, API_KEY, aria2Integration);

    // Act
    const getAsync = async () => await aria2Integration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(getAsync()).resolves.not.toThrow();
    expect((await getAsync()).items).toHaveLength(1);

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("Delete item should result in empty items", async () => {
    // Arrange
    const startedContainer = await createAria2Container().start();
    const aria2Integration = createAria2Intergration(startedContainer, API_KEY);
    const item = await aria2AddItemAsync(startedContainer, API_KEY, aria2Integration);

    // Act
    const actAsync = async () => await aria2Integration.deleteItemAsync(item, true);

    // Assert
    await expect(actAsync()).resolves.not.toThrow();
    // NzbGet is slow and we wait for a second before querying the items. Test was flaky without this.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = await aria2Integration.getClientJobsAndStatusAsync({ limit: 99 });
    expect(result.items).toHaveLength(0);

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds
});

const createAria2Container = () => {
  return new GenericContainer(IMAGE_NAME)
    .withExposedPorts(8080)
    .withEnvironment({
      PUID: "1000",
      PGID: "1000",
      ARIA2RPCPORT: "443",
      RPC_SECRET: API_KEY,
    })
    .withWaitStrategy(Wait.forLogMessage("listening on TCP port"));
};

const createAria2Intergration = (container: StartedTestContainer, apikey: string) => {
  return new Aria2Integration({
    id: "1",
    decryptedSecrets: [
      {
        kind: "apiKey",
        value: apikey,
      },
    ],
    name: "Aria2",
    url: `http://${container.getHost()}:${container.getMappedPort(8080)}`,
    externalUrl: null,
  });
};

const aria2AddItemAsync = async (container: StartedTestContainer, apiKey: string, integration: Aria2Integration) => {
  await fetch(`http://${container.getHost()}:${container.getMappedPort(8080)}/jsonrpc`, {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: btoa(["Homarr", Date.now().toString(), Math.random()].join(".")), // unique id per request
      method: "aria2.addUri",
      params: [`token:${apiKey}`, ["https://google.com"]],
    }),
  });

  await delay(3000);

  const {
    items: [item],
  } = await integration.getClientJobsAndStatusAsync({ limit: 99 });

  if (!item) {
    throw new Error("No item found");
  }

  return item;
};
const delay = (microseconds: number) => new Promise((resolve) => setTimeout(resolve, microseconds));
