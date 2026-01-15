import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { describe, expect, test, vi } from "vitest";

import { eq } from "@homarr/db";
import type { Database } from "@homarr/db";
import { groupMembers, groups, users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";
import { colorSchemeCookieKey, everyoneGroup } from "@homarr/definitions";

import { createSignInEventHandler } from "../events";

vi.mock("next-auth", () => ({}));
vi.mock("../env", () => {
  return {
    env: {
      AUTH_OIDC_GROUPS_ATTRIBUTE: "someRandomGroupsKey",
    },
  };
});
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type HeadersExport = typeof import("next/headers");
vi.mock("next/headers", async (importOriginal) => {
  const mod = await importOriginal<HeadersExport>();

  const result = {
    set: (name: string, value: string, options: Partial<ResponseCookie>) => options as ResponseCookie,
  } as unknown as ReadonlyRequestCookies;

  vi.spyOn(result, "set");

  const cookies = () => Promise.resolve(result);

  return { ...mod, cookies } satisfies HeadersExport;
});

describe("createSignInEventHandler should create signInEventHandler", () => {
  describe("signInEventHandler should add users to everyone group", () => {
    test("should add user to everyone group if he isn't already", async () => {
      // Arrange
      const db = createDb();
      await createUserAsync(db);
      await createGroupAsync(db, everyoneGroup);
      const eventHandler = createSignInEventHandler(db);

      // Act
      await eventHandler?.({
        user: { id: "1", name: "test" },
        profile: undefined,
        account: null,
      });

      // Assert
      const dbGroupMembers = await db.query.groupMembers.findFirst({
        where: eq(groupMembers.userId, "1"),
      });
      expect(dbGroupMembers?.groupId).toBe("1");
    });
  });

  describe("signInEventHandler should synchronize ldap groups", () => {
    test("should add missing group membership", async () => {
      // Arrange
      const db = createDb();
      await createUserAsync(db);
      await createGroupAsync(db);
      const eventHandler = createSignInEventHandler(db);

      // Act
      await eventHandler?.({
        user: { id: "1", name: "test", groups: ["test"] } as never,
        profile: undefined,
        account: null,
      });

      // Assert
      const dbGroupMembers = await db.query.groupMembers.findFirst({
        where: eq(groupMembers.userId, "1"),
      });
      expect(dbGroupMembers?.groupId).toBe("1");
    });
    test("should remove group membership", async () => {
      // Arrange
      const db = createDb();
      await createUserAsync(db);
      await createGroupAsync(db);
      await db.insert(groupMembers).values({
        userId: "1",
        groupId: "1",
      });
      const eventHandler = createSignInEventHandler(db);

      // Act
      await eventHandler?.({
        user: { id: "1", name: "test", groups: [] } as never,
        profile: undefined,
        account: null,
      });

      // Assert
      const dbGroupMembers = await db.query.groupMembers.findFirst({
        where: eq(groupMembers.userId, "1"),
      });
      expect(dbGroupMembers).toBeUndefined();
    });
    test("should not remove group membership for everyone group", async () => {
      // Arrange
      const db = createDb();
      await createUserAsync(db);
      await createGroupAsync(db, everyoneGroup);
      await db.insert(groupMembers).values({
        userId: "1",
        groupId: "1",
      });
      const eventHandler = createSignInEventHandler(db);

      // Act
      await eventHandler?.({
        user: { id: "1", name: "test", groups: [] } as never,
        profile: undefined,
        account: null,
      });

      // Assert
      const dbGroupMembers = await db.query.groupMembers.findFirst({
        where: eq(groupMembers.userId, "1"),
      });
      expect(dbGroupMembers?.groupId).toBe("1");
    });
  });
  describe("signInEventHandler should synchronize oidc groups", () => {
    test("should add missing group membership", async () => {
      // Arrange
      const db = createDb();
      await createUserAsync(db);
      await createGroupAsync(db);
      const eventHandler = createSignInEventHandler(db);

      // Act
      await eventHandler?.({
        user: { id: "1", name: "test" },
        profile: { preferred_username: "test", someRandomGroupsKey: ["test"] },
        account: null,
      });

      // Assert
      const dbGroupMembers = await db.query.groupMembers.findFirst({
        where: eq(groupMembers.userId, "1"),
      });
      expect(dbGroupMembers?.groupId).toBe("1");
    });
    test("should remove group membership", async () => {
      // Arrange
      const db = createDb();
      await createUserAsync(db);
      await createGroupAsync(db);
      await db.insert(groupMembers).values({
        userId: "1",
        groupId: "1",
      });
      const eventHandler = createSignInEventHandler(db);

      // Act
      await eventHandler?.({
        user: { id: "1", name: "test" },
        profile: { preferred_username: "test", someRandomGroupsKey: [] },
        account: null,
      });

      // Assert
      const dbGroupMembers = await db.query.groupMembers.findFirst({
        where: eq(groupMembers.userId, "1"),
      });
      expect(dbGroupMembers).toBeUndefined();
    });
    test("should not remove group membership for everyone group", async () => {
      // Arrange
      const db = createDb();
      await createUserAsync(db);
      await createGroupAsync(db, everyoneGroup);
      await db.insert(groupMembers).values({
        userId: "1",
        groupId: "1",
      });
      const eventHandler = createSignInEventHandler(db);

      // Act
      await eventHandler?.({
        user: { id: "1", name: "test" },
        profile: { preferred_username: "test", someRandomGroupsKey: [] },
        account: null,
      });

      // Assert
      const dbGroupMembers = await db.query.groupMembers.findFirst({
        where: eq(groupMembers.userId, "1"),
      });
      expect(dbGroupMembers?.groupId).toBe("1");
    });
  });
  test.each([
    ["ldap" as const, { name: "test-new" }, undefined],
    ["oidc" as const, { name: "test" }, { preferred_username: "test-new" }],
    ["oidc" as const, { name: "test" }, { preferred_username: "test@example.com", name: "test-new" }],
  ])("signInEventHandler should update username for %s provider", async (_provider, user, profile) => {
    // Arrange
    const db = createDb();
    await createUserAsync(db);
    const eventHandler = createSignInEventHandler(db);

    // Act
    await eventHandler?.({
      user: { id: "1", ...user },
      profile,
      account: null,
    });

    // Assert
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, "1"),
      columns: {
        name: true,
      },
    });
    expect(dbUser?.name).toBe("test-new");
  });
  test("signInEventHandler should set color-scheme cookie", async () => {
    // Arrange
    const db = createDb();
    await createUserAsync(db);
    const eventHandler = createSignInEventHandler(db);

    // Act
    await eventHandler?.({
      user: { id: "1", name: "test" },
      profile: undefined,
      account: null,
    });

    // Assert
    expect((await cookies()).set).toHaveBeenCalledWith(
      colorSchemeCookieKey,
      "dark",
      expect.objectContaining({
        path: "/",
      }),
    );
  });
});

const createUserAsync = async (db: Database) =>
  await db.insert(users).values({
    id: "1",
    name: "test",
    colorScheme: "dark",
  });

const createGroupAsync = async (db: Database, name = "test") =>
  await db.insert(groups).values({
    id: "1",
    name,
    position: 1,
  });
