import { join } from "path";
import { GenericContainer, getContainerRuntimeClient, ImageName, Wait } from "testcontainers";
import type { StartedTestContainer } from "testcontainers";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { createDb } from "@homarr/db/test";

import { SabnzbdIntegration } from "../src";
import { TestConnectionError } from "../src/base/test-connection/test-connection-error";
import type { DownloadClientItem } from "../src/interfaces/downloads/download-client-items";

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

const DEFAULT_API_KEY = "8r45mfes43s3iw7x3oecto6dl9ilxnf9";
const IMAGE_NAME = "linuxserver/sabnzbd:latest";

describe("Sabnzbd integration", () => {
  beforeAll(async () => {
    const containerRuntimeClient = await getContainerRuntimeClient();
    await containerRuntimeClient.image.pull(ImageName.fromString(IMAGE_NAME));
  }, 100_000);

  test("Test connection should work", async () => {
    // Arrange
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, DEFAULT_API_KEY);

    // Act
    const result = await sabnzbdIntegration.testConnectionAsync();

    // Assert
    expect(result.success).toBe(true);

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("Test connection should fail with wrong ApiKey", async () => {
    // Arrange
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, "wrong-api-key");

    // Act
    const result = await sabnzbdIntegration.testConnectionAsync();

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
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, DEFAULT_API_KEY);

    // Acts
    const actAsync = async () => await sabnzbdIntegration.pauseQueueAsync();
    const getAsync = async () => await sabnzbdIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(actAsync()).resolves.not.toThrow();
    await expect(getAsync()).resolves.toMatchObject({ status: { paused: true } });

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("resumeQueueAsync should work", async () => {
    // Arrange
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, DEFAULT_API_KEY);
    await sabnzbdIntegration.pauseQueueAsync();

    // Acts
    const actAsync = async () => await sabnzbdIntegration.resumeQueueAsync();
    const getAsync = async () => await sabnzbdIntegration.getClientJobsAndStatusAsync({ limit: 99 });

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
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, DEFAULT_API_KEY);

    // Act
    const getAsync = async () => await sabnzbdIntegration.getClientJobsAndStatusAsync({ limit: 99 });

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
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, DEFAULT_API_KEY);
    await sabNzbdAddItemAsync(startedContainer, DEFAULT_API_KEY, sabnzbdIntegration);

    // Act
    const getAsync = async () => await sabnzbdIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(getAsync()).resolves.not.toThrow();
    expect((await getAsync()).items).toHaveLength(1);

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("Pause item should work", async () => {
    // Arrange
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, DEFAULT_API_KEY);
    const item = await sabNzbdAddItemAsync(startedContainer, DEFAULT_API_KEY, sabnzbdIntegration);

    // Act
    const actAsync = async () => await sabnzbdIntegration.pauseItemAsync(item);
    const getAsync = async () => await sabnzbdIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(getAsync()).resolves.toMatchObject({ items: [{ ...item, state: "downloading" }] });
    await expect(actAsync()).resolves.not.toThrow();
    await expect(getAsync()).resolves.toMatchObject({ items: [{ ...item, state: "paused" }] });

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("Resume item should work", async () => {
    // Arrange
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, DEFAULT_API_KEY);
    const item = await sabNzbdAddItemAsync(startedContainer, DEFAULT_API_KEY, sabnzbdIntegration);
    await sabnzbdIntegration.pauseItemAsync(item);

    // Act
    const actAsync = async () => await sabnzbdIntegration.resumeItemAsync(item);
    const getAsync = async () => await sabnzbdIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(getAsync()).resolves.toMatchObject({ items: [{ ...item, state: "paused" }] });
    await expect(actAsync()).resolves.not.toThrow();
    await expect(getAsync()).resolves.toMatchObject({ items: [{ ...item, state: "downloading" }] });

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds

  test("Delete item should result in empty items", async () => {
    // Arrange
    const startedContainer = await createSabnzbdContainer().start();
    const sabnzbdIntegration = createSabnzbdIntegration(startedContainer, DEFAULT_API_KEY);
    const item = await sabNzbdAddItemAsync(startedContainer, DEFAULT_API_KEY, sabnzbdIntegration);

    // Act - fromDisk already doesn't work for sabnzbd, so only test deletion itself.
    const actAsync = async () =>
      await sabnzbdIntegration.deleteItemAsync({ ...item, progress: 0 } as DownloadClientItem, false);
    const getAsync = async () => await sabnzbdIntegration.getClientJobsAndStatusAsync({ limit: 99 });

    // Assert
    await expect(actAsync()).resolves.not.toThrow();
    await expect(getAsync()).resolves.toMatchObject({ items: [] });

    // Cleanup
    await startedContainer.stop();
  }, 30_000); // Timeout of 30 seconds
});

const createSabnzbdContainer = () => {
  return (
    new GenericContainer(IMAGE_NAME)
      .withCopyFilesToContainer([
        {
          source: join(__dirname, "/volumes/usenet/sabnzbd.ini"),
          target: "/config/sabnzbd.ini",
        },
      ])
      .withExposedPorts(1212)
      .withEnvironment({ PUID: "0", PGID: "0" })
      // This has to be a page that is not redirected (or a status code has to be defined withStatusCode(statusCode))
      .withWaitStrategy(Wait.forHttp("/sabnzbd/wizard/", 1212))
  );
};

const createSabnzbdIntegration = (container: StartedTestContainer, apiKey: string) => {
  return new SabnzbdIntegration({
    id: "1",
    decryptedSecrets: [
      {
        kind: "apiKey",
        value: apiKey,
      },
    ],
    name: "Sabnzbd",
    url: `http://${container.getHost()}:${container.getMappedPort(1212)}`,
    externalUrl: null,
  });
};

const sabNzbdAddItemAsync = async (
  container: StartedTestContainer,
  apiKey: string,
  integration: SabnzbdIntegration,
) => {
  // Add nzb file in the watch folder
  await container.copyFilesToContainer([
    {
      source: join(__dirname, "/volumes/usenet/test_download_100MB.nzb"),
      target: "/nzb/test_download_100MB.nzb",
    },
  ]);
  // Adding file is faster than triggering scan of the watch folder
  // (local add: 1.4-1.6s, scan trigger: 2.5-2.7s, auto scan: 2.9-3s)
  await fetch(
    `http://${container.getHost()}:${container.getMappedPort(1212)}/api` +
      "?mode=addlocalfile" +
      "&name=%2Fnzb%2Ftest_download_100MB.nzb" +
      `&apikey=${apiKey}`,
  );
  // Retries up to 5 times to let SabNzbd scan and process the nzb (1 retry should suffice tbh)
  for (let i = 0; i < 5; i++) {
    const {
      items: [item],
    } = await integration.getClientJobsAndStatusAsync({ limit: 99 });
    if (item) return item;
  }
  // Throws if it can't find the item
  throw new Error("No item found");
};
