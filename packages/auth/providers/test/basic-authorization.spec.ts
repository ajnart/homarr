import { describe, expect, test } from "vitest";

import { createId } from "@homarr/common";
import { users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";

import { createSaltAsync, hashPasswordAsync } from "../../security";
import { authorizeWithBasicCredentialsAsync } from "../credentials/authorization/basic-authorization";

const defaultUserId = createId();

describe("authorizeWithBasicCredentials", () => {
  test("should authorize user with correct credentials", async () => {
    // Arrange
    const db = createDb();
    const salt = await createSaltAsync();
    await db.insert(users).values({
      id: defaultUserId,
      name: "test",
      salt,
      password: await hashPasswordAsync("test", salt),
    });

    // Act
    const result = await authorizeWithBasicCredentialsAsync(db, {
      name: "test",
      password: "test",
    });

    // Assert
    expect(result).toEqual({ id: defaultUserId, name: "test" });
  });

  test("should not authorize user with incorrect credentials", async () => {
    // Arrange
    const db = createDb();
    const salt = await createSaltAsync();
    await db.insert(users).values({
      id: defaultUserId,
      name: "test",
      salt,
      password: await hashPasswordAsync("test", salt),
    });

    // Act
    const result = await authorizeWithBasicCredentialsAsync(db, {
      name: "test",
      password: "wrong",
    });

    // Assert
    expect(result).toBeNull();
  });

  test("should not authorize user with incorrect username", async () => {
    // Arrange
    const db = createDb();
    const salt = await createSaltAsync();
    await db.insert(users).values({
      id: defaultUserId,
      name: "test",
      salt,
      password: await hashPasswordAsync("test", salt),
    });

    // Act
    const result = await authorizeWithBasicCredentialsAsync(db, {
      name: "wrong",
      password: "test",
    });

    // Assert
    expect(result).toBeNull();
  });

  test("should not authorize user when password is not set", async () => {
    // Arrange
    const db = createDb();
    await db.insert(users).values({
      id: defaultUserId,
      name: "test",
    });

    // Act
    const result = await authorizeWithBasicCredentialsAsync(db, {
      name: "test",
      password: "test",
    });

    // Assert
    expect(result).toBeNull();
  });
});
