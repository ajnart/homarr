/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { AdapterUser } from "@auth/core/adapters";
import type { JWT } from "next-auth/jwt";
import { describe, expect, test, vi } from "vitest";

import { groupMembers, groupPermissions, groups, users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";
import * as definitions from "@homarr/definitions";

import { createSessionCallback, getCurrentUserPermissionsAsync } from "../callbacks";

// This one is placed here because it's used in multiple tests and needs to be the same reference
const setCookies = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => ({
    set: setCookies,
  }),
}));

describe("getCurrentUserPermissions", () => {
  test("should return empty permissions when non existing user requested", async () => {
    // Arrange
    const db = createDb();

    await db.insert(groups).values({
      id: "2",
      name: "test",
      position: 1,
    });
    await db.insert(groupPermissions).values({
      groupId: "2",
      permission: "admin",
    });
    await db.insert(users).values({
      id: "2",
    });

    const userId = "1";

    // Act
    const result = await getCurrentUserPermissionsAsync(db, userId);

    // Assert
    expect(result).toEqual([]);
  });

  test("should return empty permissions when user has no groups", async () => {
    // Arrange
    const db = createDb();
    const userId = "1";

    await db.insert(groups).values({
      id: "2",
      name: "test",
      position: 1,
    });
    await db.insert(groupPermissions).values({
      groupId: "2",
      permission: "admin",
    });
    await db.insert(users).values({
      id: userId,
    });

    // Act
    const result = await getCurrentUserPermissionsAsync(db, userId);

    // Assert
    expect(result).toEqual([]);
  });

  test("should return permissions for user", async () => {
    // Arrange
    const db = createDb();
    const getPermissionsWithChildrenMock = vi
      .spyOn(definitions, "getPermissionsWithChildren")
      .mockReturnValue(["board-create"]);
    const mockId = "1";

    await db.insert(users).values({
      id: mockId,
    });
    await db.insert(groups).values({
      id: mockId,
      name: "test",
      position: 1,
    });
    await db.insert(groupMembers).values({
      userId: mockId,
      groupId: mockId,
    });
    await db.insert(groupPermissions).values({
      groupId: mockId,
      permission: "admin",
    });

    // Act
    const result = await getCurrentUserPermissionsAsync(db, mockId);

    // Assert
    expect(result).toEqual(["board-create"]);
    expect(getPermissionsWithChildrenMock).toHaveBeenCalledWith(["admin"]);
  });
});

describe("session callback", () => {
  test("should add id and name to session user", async () => {
    // Arrange
    const user: AdapterUser = {
      id: "id",
      name: "name",
      email: "email",
      emailVerified: new Date("2023-01-13"),
    };
    const token: JWT = {};
    const db = createDb();
    const callback = createSessionCallback(db);

    // Act
    const result = await callback({
      session: {
        user: {
          id: "no-id",
          email: "no-email",
          emailVerified: new Date("2023-01-13"),
          permissions: [],
          colorScheme: "dark",
        },
        expires: "2023-01-13" as Date & string,
        sessionToken: "token",
        userId: "no-id",
      },
      user,
      token,
      trigger: "update",
      newSession: {},
    });

    // Assert
    expect(result.user).toBeDefined();
    expect(result.user!.id).toEqual(user.id);
    expect(result.user!.name).toEqual(user.name);
  });
});
