import { CredentialsSignin } from "@auth/core/errors";
import { describe, expect, test, vi } from "vitest";

import { createId } from "@homarr/common";
import type { Database } from "@homarr/db";
import { and, eq } from "@homarr/db";
import { groups, users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";

import { authorizeWithLdapCredentialsAsync } from "../credentials/authorization/ldap-authorization";
import * as ldapClient from "../credentials/ldap-client";

vi.mock("../../env", () => ({
  env: {
    AUTH_LDAP_BIND_DN: "bind_dn",
    AUTH_LDAP_BIND_PASSWORD: "bind_password",
    AUTH_LDAP_USER_MAIL_ATTRIBUTE: "mail",
    AUTH_LDAP_GROUP_CLASS: "group",
  },
}));

describe("authorizeWithLdapCredentials", () => {
  test("should fail when wrong ldap base credentials", async () => {
    // Arrange
    const spy = vi.spyOn(ldapClient, "LdapClient");
    spy.mockImplementation(function () {
      return {
        bindAsync: vi.fn(() => Promise.reject(new Error("bindAsync"))),
      } as unknown as ldapClient.LdapClient;
    });

    // Act
    const act = () =>
      authorizeWithLdapCredentialsAsync(null as unknown as Database, {
        name: "test",
        password: "test",
      });

    // Assert
    await expect(act()).rejects.toThrow(CredentialsSignin);
  });

  test("should fail when user not found", async () => {
    // Arrange
    const spy = vi.spyOn(ldapClient, "LdapClient");
    spy.mockImplementation(function () {
      return {
        bindAsync: vi.fn(() => Promise.resolve()),
        searchAsync: vi.fn(() => Promise.resolve([])),
      } as unknown as ldapClient.LdapClient;
    });

    // Act
    const act = () =>
      authorizeWithLdapCredentialsAsync(null as unknown as Database, {
        name: "test",
        password: "test",
      });

    // Assert
    await expect(act()).rejects.toThrow(CredentialsSignin);
  });

  test("should fail when user has invalid email", async () => {
    // Arrange
    const spy = vi.spyOn(ldapClient, "LdapClient");
    spy.mockImplementation(function () {
      return {
        bindAsync: vi.fn(() => Promise.resolve()),
        searchAsync: vi.fn(() =>
          Promise.resolve([
            {
              dn: "test",
              mail: "test",
            },
          ]),
        ),
      } as unknown as ldapClient.LdapClient;
    });

    // Act
    const act = () =>
      authorizeWithLdapCredentialsAsync(null as unknown as Database, {
        name: "test",
        password: "test",
      });

    // Assert
    await expect(act()).rejects.toThrow(CredentialsSignin);
  });

  test("should fail when user password is incorrect", async () => {
    // Arrange
    const searchSpy = vi.fn(() =>
      Promise.resolve([
        {
          dn: "test",
          mail: "test@gmail.com",
        },
      ]),
    );
    const spy = vi.spyOn(ldapClient, "LdapClient");
    spy.mockImplementation(function () {
      return {
        bindAsync: vi.fn((props: ldapClient.BindOptions) =>
          props.distinguishedName === "test" ? Promise.reject(new Error("bindAsync")) : Promise.resolve(),
        ),
        searchAsync: searchSpy,
      } as unknown as ldapClient.LdapClient;
    });

    // Act
    const act = () =>
      authorizeWithLdapCredentialsAsync(null as unknown as Database, {
        name: "test",
        password: "test",
      });

    // Assert
    await expect(act()).rejects.toThrow(CredentialsSignin);
    expect(searchSpy).toHaveBeenCalledTimes(1);
  });

  test("should authorize user with correct credentials and create user", async () => {
    // Arrange
    const db = createDb();
    const spy = vi.spyOn(ldapClient, "LdapClient");
    spy.mockImplementation(function () {
      return {
        bindAsync: vi.fn(() => Promise.resolve()),
        searchAsync: vi.fn(() =>
          Promise.resolve([
            {
              dn: "test",
              mail: "test@gmail.com",
            },
          ]),
        ),
        disconnectAsync: vi.fn(),
      } as unknown as ldapClient.LdapClient;
    });

    // Act
    const result = await authorizeWithLdapCredentialsAsync(db, {
      name: "test",
      password: "test",
    });

    // Assert
    expect(result.name).toBe("test");
    expect(result.groups).toHaveLength(0); // Groups are needed in signIn events callback
    const dbUser = await db.query.users.findFirst({
      where: eq(users.name, "test"),
    });
    expect(dbUser).toBeDefined();
    expect(dbUser?.id).toBe(result.id);
    expect(dbUser?.email).toBe("test@gmail.com");
    expect(dbUser?.emailVerified).not.toBeNull();
    expect(dbUser?.provider).toBe("ldap");
  });

  test("should authorize user with correct credentials and create user with same email when credentials user already exists", async () => {
    // Arrange
    const db = createDb();
    const spy = vi.spyOn(ldapClient, "LdapClient");
    spy.mockImplementation(function () {
      return {
        bindAsync: vi.fn(() => Promise.resolve()),
        searchAsync: vi.fn(() =>
          Promise.resolve([
            {
              dn: "test",
              mail: "test@gmail.com",
            },
          ]),
        ),
        disconnectAsync: vi.fn(),
      } as unknown as ldapClient.LdapClient;
    });
    await db.insert(users).values({
      id: createId(),
      name: "test",
      email: "test@gmail.com",
      provider: "credentials",
    });

    // Act
    const result = await authorizeWithLdapCredentialsAsync(db, {
      name: "test",
      password: "test",
    });

    // Assert
    expect(result.name).toBe("test");
    expect(result.groups).toHaveLength(0); // Groups are needed in signIn events callback
    const dbUser = await db.query.users.findFirst({
      where: and(eq(users.name, "test"), eq(users.provider, "ldap")),
    });
    expect(dbUser).toBeDefined();
    expect(dbUser?.id).toBe(result.id);
    expect(dbUser?.email).toBe("test@gmail.com");
    expect(dbUser?.emailVerified).not.toBeNull();
    expect(dbUser?.provider).toBe("ldap");

    const credentialsUser = await db.query.users.findFirst({
      where: and(eq(users.name, "test"), eq(users.provider, "credentials")),
    });

    expect(credentialsUser).toBeDefined();
    expect(credentialsUser?.id).not.toBe(result.id);
  });

  // The name update occurs in the signIn event callback
  test("should authorize user with correct credentials and return updated name", async () => {
    // Arrange
    const spy = vi.spyOn(ldapClient, "LdapClient");
    spy.mockImplementation(function () {
      return {
        bindAsync: vi.fn(() => Promise.resolve()),
        searchAsync: vi.fn(() =>
          Promise.resolve([
            {
              dn: "test55",
              mail: "test@gmail.com",
            },
          ]),
        ),
        disconnectAsync: vi.fn(),
      } as unknown as ldapClient.LdapClient;
    });

    const userId = createId();
    const db = createDb();
    await db.insert(users).values({
      id: userId,
      name: "test-old",
      email: "test@gmail.com",
      provider: "ldap",
    });

    // Act
    const result = await authorizeWithLdapCredentialsAsync(db, {
      name: "test",
      password: "test",
    });

    // Assert
    expect(result).toEqual({ id: userId, name: "test", groups: [] });

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    expect(dbUser).toBeDefined();
    expect(dbUser?.id).toBe(userId);
    expect(dbUser?.name).toBe("test-old");
    expect(dbUser?.email).toBe("test@gmail.com");
    expect(dbUser?.provider).toBe("ldap");
  });

  test("should authorize user with correct credentials and return his groups", async () => {
    // Arrange
    const spy = vi.spyOn(ldapClient, "LdapClient");
    spy.mockImplementation(function () {
      return {
        bindAsync: vi.fn(() => Promise.resolve()),
        searchAsync: vi.fn((argument: { options: { filter: string } }) =>
          argument.options.filter.includes("group")
            ? Promise.resolve([
                {
                  cn: "homarr_example",
                },
              ])
            : Promise.resolve([
                {
                  dn: "test55",
                  mail: "test@gmail.com",
                },
              ]),
        ),
        disconnectAsync: vi.fn(),
      } as unknown as ldapClient.LdapClient;
    });
    const db = createDb();
    const userId = createId();
    await db.insert(users).values({
      id: userId,
      name: "test",
      email: "test@gmail.com",
      provider: "ldap",
    });

    const groupId = createId();
    await db.insert(groups).values({
      id: groupId,
      name: "homarr_example",
      position: 1,
    });

    // Act
    const result = await authorizeWithLdapCredentialsAsync(db, {
      name: "test",
      password: "test",
    });

    // Assert
    expect(result).toEqual({ id: userId, name: "test", groups: ["homarr_example"] });
  });
});
