/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, test, vi } from "vitest";

import type { Session } from "@homarr/auth";
import { createId } from "@homarr/common";
import { apps } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";
import type { GroupPermissionKey } from "@homarr/definitions";

import { appRouter } from "../app";
import * as appAccessControl from "../app/app-access-control";

// Mock the auth module to return an empty session
vi.mock("@homarr/auth", () => ({ auth: () => ({}) as Session }));

const createDefaultSession = (permissions: GroupPermissionKey[] = []): Session => ({
  user: { id: createId(), permissions, colorScheme: "light" },
  expires: new Date().toISOString(),
});

describe("all should return all apps", () => {
  test("should return all apps with session", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: createDefaultSession(),
    });

    await db.insert(apps).values([
      {
        id: "2",
        name: "Mantine",
        description: "React components and hooks library",
        iconUrl: "https://mantine.dev/favicon.svg",
        href: "https://mantine.dev",
      },
      {
        id: "1",
        name: "Tabler Icons",
        iconUrl: "https://tabler.io/favicon.ico",
      },
    ]);

    const result = await caller.all();
    expect(result.length).toBe(2);
    expect(result[0]!.id).toBe("2");
    expect(result[1]!.id).toBe("1");
    expect(result[0]!.href).toBeDefined();
    expect(result[0]!.description).toBeDefined();
    expect(result[1]!.href).toBeNull();
    expect(result[1]!.description).toBeNull();
  });
  test("should throw UNAUTHORIZED if the user is not authenticated", async () => {
    // Arrange
    const caller = appRouter.createCaller({
      db: createDb(),
      deviceType: undefined,
      session: null,
    });

    // Act
    const actAsync = async () => await caller.all();

    // Assert
    await expect(actAsync()).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("byId should return an app by id", () => {
  test("should return an app by id when canUserSeeAppAsync returns true", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: null,
    });
    vi.spyOn(appAccessControl, "canUserSeeAppAsync").mockReturnValue(Promise.resolve(true));

    await db.insert(apps).values([
      {
        id: "2",
        name: "Mantine",
        description: "React components and hooks library",
        iconUrl: "https://mantine.dev/favicon.svg",
        href: "https://mantine.dev",
      },
      {
        id: "1",
        name: "Tabler Icons",
        iconUrl: "https://tabler.io/favicon.ico",
      },
    ]);

    // Act
    const result = await caller.byId({ id: "2" });

    // Assert
    expect(result.name).toBe("Mantine");
  });

  test("should throw NOT_FOUND error when canUserSeeAppAsync returns false", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: null,
    });
    await db.insert(apps).values([
      {
        id: "2",
        name: "Mantine",
        description: "React components and hooks library",
        iconUrl: "https://mantine.dev/favicon.svg",
        href: "https://mantine.dev",
      },
    ]);
    vi.spyOn(appAccessControl, "canUserSeeAppAsync").mockReturnValue(Promise.resolve(false));

    // Act
    const actAsync = async () => await caller.byId({ id: "2" });

    // Assert
    await expect(actAsync()).rejects.toThrow("App not found");
  });

  test("should throw an error if the app does not exist", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: null,
    });

    // Act
    const actAsync = async () => await caller.byId({ id: "2" });

    // Assert
    await expect(actAsync()).rejects.toThrow("App not found");
  });
});

describe("create should create a new app with all arguments", () => {
  test("should create a new app", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: createDefaultSession(["app-create"]),
    });
    const input = {
      name: "Mantine",
      description: "React components and hooks library",
      iconUrl: "https://mantine.dev/favicon.svg",
      href: "https://mantine.dev",
      pingUrl: "https://mantine.dev/a",
    };

    // Act
    await caller.create(input);

    // Assert
    const dbApp = await db.query.apps.findFirst();
    expect(dbApp).toBeDefined();
    expect(dbApp!.name).toBe(input.name);
    expect(dbApp!.description).toBe(input.description);
    expect(dbApp!.iconUrl).toBe(input.iconUrl);
    expect(dbApp!.href).toBe(input.href);
    expect(dbApp!.pingUrl).toBe(input.pingUrl);
  });

  test("should create a new app only with required arguments", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: createDefaultSession(["app-create"]),
    });
    const input = {
      name: "Mantine",
      description: null,
      iconUrl: "https://mantine.dev/favicon.svg",
      href: null,
      pingUrl: "",
    };

    // Act
    await caller.create(input);

    // Assert
    const dbApp = await db.query.apps.findFirst();
    expect(dbApp).toBeDefined();
    expect(dbApp!.name).toBe(input.name);
    expect(dbApp!.description).toBe(input.description);
    expect(dbApp!.iconUrl).toBe(input.iconUrl);
    expect(dbApp!.href).toBe(input.href);
    expect(dbApp!.pingUrl).toBe(null);
  });
});

describe("update should update an app", () => {
  test("should update an app", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: createDefaultSession(["app-modify-all"]),
    });

    const appId = createId();
    const toInsert = {
      id: appId,
      name: "Mantine",
      iconUrl: "https://mantine.dev/favicon.svg",
    };

    await db.insert(apps).values(toInsert);

    const input = {
      id: appId,
      name: "Mantine2",
      description: "React components and hooks library",
      iconUrl: "https://mantine.dev/favicon.svg2",
      href: "https://mantine.dev",
      pingUrl: "https://mantine.dev/a",
    };

    // Act
    await caller.update(input);

    // Assert
    const dbApp = await db.query.apps.findFirst();

    expect(dbApp).toBeDefined();
    expect(dbApp!.name).toBe(input.name);
    expect(dbApp!.description).toBe(input.description);
    expect(dbApp!.iconUrl).toBe(input.iconUrl);
    expect(dbApp!.href).toBe(input.href);
  });

  test("should throw an error if the app does not exist", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: createDefaultSession(["app-modify-all"]),
    });

    // Act
    const actAsync = async () =>
      await caller.update({
        id: createId(),
        name: "Mantine",
        iconUrl: "https://mantine.dev/favicon.svg",
        description: null,
        href: null,
        pingUrl: "",
      });

    // Assert
    await expect(actAsync()).rejects.toThrow("App not found");
  });
});

describe("delete should delete an app", () => {
  test("should delete an app", async () => {
    // Arrange
    const db = createDb();
    const caller = appRouter.createCaller({
      db,
      deviceType: undefined,
      session: createDefaultSession(["app-full-all"]),
    });

    const appId = createId();
    await db.insert(apps).values({
      id: appId,
      name: "Mantine",
      iconUrl: "https://mantine.dev/favicon.svg",
    });

    // Act
    await caller.delete({ id: appId });

    // Assert
    const dbApp = await db.query.apps.findFirst();
    expect(dbApp).toBeUndefined();
  });
});
