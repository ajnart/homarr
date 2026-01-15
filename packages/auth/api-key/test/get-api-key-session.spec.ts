/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, test, vi } from "vitest";

import { createId } from "@homarr/common";
import { apiKeys, users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";

import { createSaltAsync, hashPasswordAsync } from "../../security";
import { getSessionFromApiKeyAsync } from "../get-api-key-session";

// Mock the logger to avoid console output during tests
vi.mock("@homarr/core/infrastructure/logs", () => ({
  createLogger: () => ({
    warn: vi.fn(),
    info: vi.fn(),
  }),
}));

const defaultUserId = createId();
const defaultUsername = "testuser";
const defaultApiKeyId = createId();
const defaultIpAddress = "127.0.0.1";
const defaultUserAgent = "test-agent";
const defaultLogParams = [defaultIpAddress, defaultUserAgent] as const;

describe("getSessionFromApiKeyAsync", () => {
  test("should return null when api key header is null", async () => {
    // Arrange
    const { db } = await setupAsync();
    const apiKey = null;

    // Act
    const result = await getSessionFromApiKeyAsync(db, apiKey, ...defaultLogParams);

    // Assert
    expect(result).toBeNull();
  });

  test.each([
    ["invalidformat", "no dot"],
    ["keyid.", "missing token"],
    [".token", "missing id"],
  ])("should return null when api key format is invalid key=%s reason=%s", async (apiKey) => {
    // Arrange
    const { db } = await setupAsync();

    // Act
    const result = await getSessionFromApiKeyAsync(db, apiKey, ...defaultLogParams);

    // Assert
    expect(result).toBeNull();
  });

  test("should return null when api key is not found in database", async () => {
    // Arrange
    const { db } = await setupAsync();

    // Act
    const result = await getSessionFromApiKeyAsync(db, "nonexistent.token", ...defaultLogParams);

    // Assert
    expect(result).toBeNull();
  });

  test("should return null when api key token does not match", async () => {
    // Arrange
    const { db } = await setupAsync({ token: "correcttoken" });

    // Act
    const result = await getSessionFromApiKeyAsync(db, `${defaultApiKeyId}.wrongtoken`, ...defaultLogParams);

    // Assert
    expect(result).toBeNull();
  });

  test("should return session when api key is valid", async () => {
    // Arrange
    const token = "validtesttoken123";
    const { db } = await setupAsync({ token });

    // Act
    const result = await getSessionFromApiKeyAsync(db, `${defaultApiKeyId}.${token}`, ...defaultLogParams);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.user.id).toEqual(defaultUserId);
    expect(result!.user.name).toEqual(defaultUsername);
  });

  test("should work with null ip address", async () => {
    // Arrange
    const token = "validtesttoken456";
    const { db } = await setupAsync({ token });

    // Act
    const result = await getSessionFromApiKeyAsync(db, `${defaultApiKeyId}.${token}`, null, defaultUserAgent);

    // Assert
    expect(result).not.toBeNull();
    expect(result!.user.id).toEqual(defaultUserId);
  });
});

interface SetupOptions {
  /**
   * If provided, inserts an API key into the database for testing.
   */
  token?: string;
}

const setupAsync = async (options?: SetupOptions) => {
  const db = createDb();

  await db.insert(users).values({
    id: defaultUserId,
    name: defaultUsername,
    email: "test@example.com",
  });

  if (options?.token) {
    const salt = await createSaltAsync();
    await db.insert(apiKeys).values({
      id: defaultApiKeyId,
      apiKey: await hashPasswordAsync(options.token, salt),
      salt,
      userId: defaultUserId,
    });
  }

  return {
    db,
  };
};
