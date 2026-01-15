/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, test, vi } from "vitest";

import type { Session } from "@homarr/auth";
import { createId } from "@homarr/common";
import { encryptSecret } from "@homarr/common/server";
import { apps, integrations, integrationSecrets } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";
import type { GroupPermissionKey } from "@homarr/definitions";

import { integrationRouter } from "../../integration/integration-router";
import { expectToBeDefined } from "../helper";

const defaultUserId = createId();
const defaultSessionWithPermissions = (permissions: GroupPermissionKey[] = []) =>
  ({
    user: {
      id: defaultUserId,
      permissions,
      colorScheme: "light",
    },
    expires: new Date().toISOString(),
  }) satisfies Session;

// Mock the auth module to return an empty session
vi.mock("@homarr/auth", () => ({ auth: () => ({}) as Session }));
vi.mock("../../integration/integration-test-connection", () => ({
  testConnectionAsync: async () => await Promise.resolve({ success: true }),
}));

describe("all should return all integrations", () => {
  test("with any session should return all integrations", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(),
    });

    await db.insert(integrations).values([
      {
        id: "1",
        name: "Home assistant",
        kind: "homeAssistant",
        url: "http://homeassist.local",
      },
      {
        id: "2",
        name: "Home plex server",
        kind: "plex",
        url: "http://plex.local",
      },
    ]);

    const result = await caller.all();
    expect(result.length).toBe(2);
    expect(result[0]!.kind).toBe("plex");
    expect(result[1]!.kind).toBe("homeAssistant");
  });
});

describe("byId should return an integration by id", () => {
  test("with full access should return an integration by id", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-full-all"]),
    });

    await db.insert(integrations).values([
      {
        id: "1",
        name: "Home assistant",
        kind: "homeAssistant",
        url: "http://homeassist.local",
      },
      {
        id: "2",
        name: "Home plex server",
        kind: "plex",
        url: "http://plex.local",
      },
    ]);

    const result = await caller.byId({ id: "2" });
    expect(result.kind).toBe("plex");
  });

  test("with full access should throw an error if the integration does not exist", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-full-all"]),
    });

    const actAsync = async () => await caller.byId({ id: "2" });
    await expect(actAsync()).rejects.toThrow("Integration not found");
  });

  test("with full access should only return the public secret values", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-full-all"]),
    });

    await db.insert(integrations).values([
      {
        id: "1",
        name: "Home assistant",
        kind: "homeAssistant",
        url: "http://homeassist.local",
      },
    ]);
    await db.insert(integrationSecrets).values([
      {
        kind: "username",
        value: encryptSecret("musterUser"),
        integrationId: "1",
        updatedAt: new Date(),
      },
      {
        kind: "password",
        value: encryptSecret("Password123!"),
        integrationId: "1",
        updatedAt: new Date(),
      },
      {
        kind: "apiKey",
        value: encryptSecret("1234567890"),
        integrationId: "1",
        updatedAt: new Date(),
      },
    ]);

    const result = await caller.byId({ id: "1" });
    expect(result.secrets.length).toBe(3);
    const username = expectToBeDefined(result.secrets.find((secret) => secret.kind === "username"));
    expect(username.value).not.toBeNull();
    const password = expectToBeDefined(result.secrets.find((secret) => secret.kind === "password"));
    expect(password.value).toBeNull();
    const apiKey = expectToBeDefined(result.secrets.find((secret) => secret.kind === "apiKey"));
    expect(apiKey.value).toBeNull();
  });

  test("without full access should throw integration not found error", async () => {
    // Arrange
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-interact-all"]),
    });

    await db.insert(integrations).values([
      {
        id: "1",
        name: "Home assistant",
        kind: "homeAssistant",
        url: "http://homeassist.local",
      },
    ]);

    // Act
    const actAsync = async () => await caller.byId({ id: "1" });

    // Assert
    await expect(actAsync()).rejects.toThrow("Integration not found");
  });
});

describe("create should create a new integration", () => {
  test("with create integration access should create a new integration", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-create"]),
    });
    const input = {
      name: "Jellyfin",
      kind: "jellyfin" as const,
      url: "http://jellyfin.local",
      secrets: [{ kind: "apiKey" as const, value: "1234567890" }],
      attemptSearchEngineCreation: false,
    };

    const fakeNow = new Date("2023-07-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);
    await caller.create(input);
    vi.useRealTimers();

    const dbIntegration = await db.query.integrations.findFirst();
    const dbSecret = await db.query.integrationSecrets.findFirst();
    expect(dbIntegration).toBeDefined();
    expect(dbIntegration!.name).toBe(input.name);
    expect(dbIntegration!.kind).toBe(input.kind);
    expect(dbIntegration!.url).toBe(input.url);

    expect(dbSecret!.integrationId).toBe(dbIntegration!.id);
    expect(dbSecret).toBeDefined();
    expect(dbSecret!.kind).toBe(input.secrets[0]!.kind);
    expect(dbSecret!.value).toMatch(/^[a-f0-9]+.[a-f0-9]+$/);
    expect(dbSecret!.updatedAt).toEqual(fakeNow);
  });

  test("with create integration access should create a new integration when creating search engine", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-create"]),
    });
    const input = {
      name: "Jellyseerr",
      kind: "jellyseerr" as const,
      url: "http://jellyseerr.local",
      secrets: [{ kind: "apiKey" as const, value: "1234567890" }],
      attemptSearchEngineCreation: true,
    };

    const fakeNow = new Date("2023-07-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);
    await caller.create(input);
    vi.useRealTimers();

    const dbIntegration = await db.query.integrations.findFirst();
    const dbSecret = await db.query.integrationSecrets.findFirst();
    const dbSearchEngine = await db.query.searchEngines.findFirst();
    expect(dbIntegration).toBeDefined();
    expect(dbIntegration!.name).toBe(input.name);
    expect(dbIntegration!.kind).toBe(input.kind);
    expect(dbIntegration!.url).toBe(input.url);

    expect(dbSecret!.integrationId).toBe(dbIntegration!.id);
    expect(dbSecret).toBeDefined();
    expect(dbSecret!.kind).toBe(input.secrets[0]!.kind);
    expect(dbSecret!.value).toMatch(/^[a-f0-9]+.[a-f0-9]+$/);
    expect(dbSecret!.updatedAt).toEqual(fakeNow);

    expect(dbSearchEngine!.integrationId).toBe(dbIntegration!.id);
    expect(dbSearchEngine!.short).toBe("j");
    expect(dbSearchEngine!.name).toBe(input.name);
    expect(dbSearchEngine!.iconUrl).toBe(
      "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@master/svg/jellyseerr.svg",
    );
  });

  test("with create integration access should create a new integration with new linked app", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-create", "app-create"]),
    });
    const input = {
      name: "Jellyfin",
      kind: "jellyfin" as const,
      url: "http://jellyfin.local",
      secrets: [{ kind: "apiKey" as const, value: "1234567890" }],
      attemptSearchEngineCreation: false,
      app: {
        name: "Jellyfin",
        description: null,
        pingUrl: "http://jellyfin.local",
        href: "https://jellyfin.home",
        iconUrl: "logo.png",
      },
    };

    const fakeNow = new Date("2023-07-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);
    await caller.create(input);
    vi.useRealTimers();

    const dbIntegration = await db.query.integrations.findFirst({
      with: {
        app: true,
      },
    });
    const dbSecret = await db.query.integrationSecrets.findFirst();
    expect(dbIntegration).toBeDefined();
    expect(dbIntegration!.name).toBe(input.name);
    expect(dbIntegration!.kind).toBe(input.kind);
    expect(dbIntegration!.url).toBe(input.url);
    expect(dbIntegration!.app!.name).toBe(input.app.name);
    expect(dbIntegration!.app!.pingUrl).toBe(input.app.pingUrl);
    expect(dbIntegration!.app!.href).toBe(input.app.href);
    expect(dbIntegration!.app!.iconUrl).toBe(input.app.iconUrl);

    expect(dbSecret!.integrationId).toBe(dbIntegration!.id);
    expect(dbSecret).toBeDefined();
    expect(dbSecret!.kind).toBe(input.secrets[0]!.kind);
    expect(dbSecret!.value).toMatch(/^[a-f0-9]+.[a-f0-9]+$/);
    expect(dbSecret!.updatedAt).toEqual(fakeNow);
  });

  test("with create integration access should create a new integration with existing linked app", async () => {
    const db = createDb();
    const appId = createId();
    await db.insert(apps).values({
      id: appId,
      name: "Existing Jellyfin",
      iconUrl: "logo.png",
    });

    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-create"]),
    });
    const input = {
      name: "Jellyfin",
      kind: "jellyfin" as const,
      url: "http://jellyfin.local",
      secrets: [{ kind: "apiKey" as const, value: "1234567890" }],
      attemptSearchEngineCreation: false,
      app: {
        id: appId,
      },
    };

    const fakeNow = new Date("2023-07-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);
    await caller.create(input);
    vi.useRealTimers();

    const dbIntegration = await db.query.integrations.findFirst();
    const dbSecret = await db.query.integrationSecrets.findFirst();
    expect(dbIntegration).toBeDefined();
    expect(dbIntegration!.name).toBe(input.name);
    expect(dbIntegration!.kind).toBe(input.kind);
    expect(dbIntegration!.url).toBe(input.url);
    expect(dbIntegration!.appId).toBe(appId);

    expect(dbSecret!.integrationId).toBe(dbIntegration!.id);
    expect(dbSecret).toBeDefined();
    expect(dbSecret!.kind).toBe(input.secrets[0]!.kind);
    expect(dbSecret!.value).toMatch(/^[a-f0-9]+.[a-f0-9]+$/);
    expect(dbSecret!.updatedAt).toEqual(fakeNow);
  });

  test("without create integration access should throw permission error", async () => {
    // Arrange
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-interact-all"]),
    });
    const input = {
      name: "Jellyfin",
      kind: "jellyfin" as const,
      url: "http://jellyfin.local",
      secrets: [{ kind: "apiKey" as const, value: "1234567890" }],
      attemptSearchEngineCreation: false,
    };

    // Act
    const actAsync = async () => await caller.create(input);

    // Assert
    await expect(actAsync()).rejects.toThrow("Permission denied");
  });

  test("without create app access should throw permission error with new linked app", async () => {
    // Arrange
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-create"]),
    });
    const input = {
      name: "Jellyfin",
      kind: "jellyfin" as const,
      url: "http://jellyfin.local",
      secrets: [{ kind: "apiKey" as const, value: "1234567890" }],
      attemptSearchEngineCreation: false,
      app: {
        name: "Jellyfin",
        description: null,
        href: "https://jellyfin.home",
        iconUrl: "logo.png",
        pingUrl: null,
      },
    };

    // Act
    const actAsync = async () => await caller.create(input);

    // Assert
    await expect(actAsync()).rejects.toThrow("Permission denied");
  });
});

describe("update should update an integration", () => {
  test("with full access should update an integration", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-full-all"]),
    });

    const lastWeek = new Date("2023-06-24T00:00:00Z");
    const appId = createId();
    const integrationId = createId();
    const toInsert = {
      id: integrationId,
      name: "Pi Hole",
      kind: "piHole" as const,
      url: "http://hole.local",
    };

    await db.insert(apps).values({
      id: appId,
      name: "Previous",
      iconUrl: "logo.png",
    });
    await db.insert(integrations).values(toInsert);

    const usernameToInsert = {
      kind: "username" as const,
      value: encryptSecret("musterUser"),
      integrationId,
      updatedAt: lastWeek,
    };

    const passwordToInsert = {
      kind: "password" as const,
      value: encryptSecret("Password123!"),
      integrationId,
      updatedAt: lastWeek,
    };
    await db.insert(integrationSecrets).values([usernameToInsert, passwordToInsert]);

    const input = {
      id: integrationId,
      name: "Milky Way Pi Hole",
      kind: "piHole" as const,
      url: "http://milkyway.local",
      secrets: [
        { kind: "username" as const, value: "newUser" },
        { kind: "password" as const, value: null },
        { kind: "apiKey" as const, value: "1234567890" },
      ],
      appId,
    };

    const fakeNow = new Date("2023-07-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);
    await caller.update(input);
    vi.useRealTimers();

    const dbIntegration = await db.query.integrations.findFirst();
    const dbSecrets = await db.query.integrationSecrets.findMany();

    expect(dbIntegration).toBeDefined();
    expect(dbIntegration!.name).toBe(input.name);
    expect(dbIntegration!.kind).toBe(input.kind);
    expect(dbIntegration!.url).toBe(input.url);
    expect(dbIntegration!.appId).toBe(appId);

    expect(dbSecrets.length).toBe(3);
    const username = expectToBeDefined(dbSecrets.find((secret) => secret.kind === "username"));
    const password = expectToBeDefined(dbSecrets.find((secret) => secret.kind === "password"));
    const apiKey = expectToBeDefined(dbSecrets.find((secret) => secret.kind === "apiKey"));
    expect(username.value).toMatch(/^[a-f0-9]+.[a-f0-9]+$/);
    expect(password.value).toMatch(/^[a-f0-9]+.[a-f0-9]+$/);
    expect(apiKey.value).toMatch(/^[a-f0-9]+.[a-f0-9]+$/);
    expect(username.updatedAt).toEqual(fakeNow);
    expect(password.updatedAt).toEqual(lastWeek);
    expect(apiKey.updatedAt).toEqual(fakeNow);
    expect(username.value).not.toEqual(usernameToInsert.value);
    expect(password.value).toEqual(passwordToInsert.value);
    expect(apiKey.value).not.toEqual(input.secrets[2]!.value);
  });

  test("with full access should throw an error if the integration does not exist", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-full-all"]),
    });

    const actAsync = async () =>
      await caller.update({
        id: createId(),
        name: "Pi Hole",
        url: "http://hole.local",
        secrets: [],
        appId: null,
      });
    await expect(actAsync()).rejects.toThrow("Integration not found");
  });

  test("without full access should throw permission error", async () => {
    // Arrange
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-interact-all"]),
    });

    // Act
    const actAsync = async () =>
      await caller.update({
        id: createId(),
        name: "Pi Hole",
        url: "http://hole.local",
        secrets: [],
        appId: null,
      });

    // Assert
    await expect(actAsync()).rejects.toThrow("Integration not found");
  });
});

describe("delete should delete an integration", () => {
  test("with full access should delete an integration", async () => {
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-full-all"]),
    });

    const integrationId = createId();
    await db.insert(integrations).values({
      id: integrationId,
      name: "Home assistant",
      kind: "homeAssistant",
      url: "http://homeassist.local",
    });

    await db.insert(integrationSecrets).values([
      {
        kind: "username",
        value: encryptSecret("example"),
        integrationId,
        updatedAt: new Date(),
      },
    ]);

    await caller.delete({ id: integrationId });

    const dbIntegration = await db.query.integrations.findFirst();
    expect(dbIntegration).toBeUndefined();
    const dbSecrets = await db.query.integrationSecrets.findMany();
    expect(dbSecrets.length).toBe(0);
  });

  test("without full access should throw permission error", async () => {
    // Arrange
    const db = createDb();
    const caller = integrationRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSessionWithPermissions(["integration-interact-all"]),
    });

    // Act
    const actAsync = async () => await caller.delete({ id: createId() });

    // Assert
    await expect(actAsync()).rejects.toThrow("Integration not found");
  });
});
