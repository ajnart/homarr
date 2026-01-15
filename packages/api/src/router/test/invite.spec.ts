/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, test, vi } from "vitest";

import type { Session } from "@homarr/auth";
import { createId } from "@homarr/common";
import { invites, users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";

import { inviteRouter } from "../invite";

const defaultSession = {
  user: {
    id: createId(),
    permissions: ["admin"],
    colorScheme: "light",
  },
  expires: new Date().toISOString(),
} satisfies Session;

// Mock the auth module to return an empty session
vi.mock("@homarr/auth", async () => {
  const mod = await import("@homarr/auth/security");
  return { ...mod, auth: () => ({}) as Session };
});

// Mock the env module to return the credentials provider
vi.mock("@homarr/auth/env", () => {
  return {
    env: {
      AUTH_PROVIDERS: ["credentials"],
    },
  };
});

describe("all should return all existing invites without sensitive informations", () => {
  test("invites should not contain sensitive informations", async () => {
    // Arrange
    const db = createDb();
    const caller = inviteRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSession,
    });

    const userId = createId();
    await db.insert(users).values({
      id: userId,
      name: "someone",
    });

    const inviteId = createId();
    await db.insert(invites).values({
      id: inviteId,
      creatorId: userId,
      expirationDate: new Date(2022, 5, 1),
      token: "token",
    });

    // Act
    const result = await caller.getAll();

    // Assert
    expect(result.length).toBe(1);
    expect(result[0]?.id).toBe(inviteId);
    expect(result[0]?.expirationDate).toEqual(new Date(2022, 5, 1));
    expect(result[0]?.creator.id).toBe(userId);
    expect(result[0]?.creator.name).toBe("someone");
    expect("token" in result[0]!).toBe(false);
  });

  test("invites should be sorted ascending by expiration date", async () => {
    // Arrange
    const db = createDb();
    const caller = inviteRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSession,
    });

    const userId = createId();
    await db.insert(users).values({
      id: userId,
      name: "someone",
    });

    const inviteId = createId();
    await db.insert(invites).values({
      id: inviteId,
      creatorId: userId,
      expirationDate: new Date(2022, 5, 1),
      token: "token",
    });
    await db.insert(invites).values({
      id: createId(),
      creatorId: userId,
      expirationDate: new Date(2022, 5, 2),
      token: "token2",
    });

    // Act
    const result = await caller.getAll();

    // Assert
    expect(result.length).toBe(2);
    expect(result[0]?.expirationDate.getDate()).toBe(1);
    expect(result[1]?.expirationDate.getDate()).toBe(2);
  });
});

describe("create should create a new invite expiring on the specified date with a token and id returned to generate url", () => {
  test("creation should work with a date in the future, but less than 6 months.", async () => {
    // Arrange
    const db = createDb();
    const caller = inviteRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSession,
    });
    await db.insert(users).values({
      id: defaultSession.user.id,
    });
    const expirationDate = new Date(2024, 5, 1); // TODO: add mock date

    // Act
    const result = await caller.createInvite({
      expirationDate,
    });

    // Assert
    expect(result.id.length).toBeGreaterThan(10);
    expect(result.token.length).toBeGreaterThan(20);

    const createdInvite = await db.query.invites.findFirst();
    expect(createdInvite).toBeDefined();
    expect(createdInvite?.id).toBe(result.id);
    expect(createdInvite?.token).toBe(result.token);
    expect(createdInvite?.expirationDate).toEqual(expirationDate);
    expect(createdInvite?.creatorId).toBe(defaultSession.user.id);
  });
});

describe("delete should remove invite by id", () => {
  test("deletion should remove present invite", async () => {
    // Arrange
    const db = createDb();
    const caller = inviteRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSession,
    });

    const userId = createId();
    await db.insert(users).values({
      id: userId,
    });
    const inviteId = createId();
    await db.insert(invites).values([
      {
        id: createId(),
        creatorId: userId,
        expirationDate: new Date(2023, 1, 1),
        token: "first-token",
      },
      {
        id: inviteId,
        creatorId: userId,
        expirationDate: new Date(2023, 1, 1),
        token: "second-token",
      },
    ]);

    // Act
    await caller.deleteInvite({ id: inviteId });

    // Assert
    const dbInvites = await db.query.invites.findMany();
    expect(dbInvites.length).toBe(1);
    expect(dbInvites[0]?.id).not.toBe(inviteId);
  });

  test("deletion should throw with NOT_FOUND code when specified invite not present", async () => {
    // Arrange
    const db = createDb();
    const caller = inviteRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSession,
    });

    const userId = createId();
    await db.insert(users).values({
      id: userId,
    });
    await db.insert(invites).values({
      id: createId(),
      creatorId: userId,
      expirationDate: new Date(2023, 1, 1),
      token: "first-token",
    });

    // Act
    const actAsync = async () => await caller.deleteInvite({ id: createId() });

    // Assert
    await expect(actAsync()).rejects.toThrow("not found");
  });
});
