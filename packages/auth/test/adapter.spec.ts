import { describe, expect, test } from "vitest";

import { users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";

import { createAdapter } from "../adapter";

describe("createAdapter should create drizzle adapter", () => {
  test.each([["credentials" as const], ["ldap" as const], ["oidc" as const]])(
    "createAdapter getUserByEmail should return user for provider %s when this provider provided",
    async (provider) => {
      // Arrange
      const db = createDb();
      const adapter = createAdapter(db, provider);
      const email = "test@example.com";
      await db.insert(users).values({ id: "1", name: "test", email, provider });

      // Act
      const user = await adapter.getUserByEmail?.(email);

      // Assert
      expect(user).toEqual({
        id: "1",
        name: "test",
        email,
        emailVerified: null,
        image: null,
      });
    },
  );

  test.each([
    ["credentials", ["ldap", "oidc"]],
    ["ldap", ["credentials", "oidc"]],
    ["oidc", ["credentials", "ldap"]],
  ] as const)(
    "createAdapter getUserByEmail should return null if only for other providers than %s exist",
    async (requestedProvider, existingProviders) => {
      // Arrange
      const db = createDb();
      const adapter = createAdapter(db, requestedProvider);
      const email = "test@example.com";
      for (const provider of existingProviders) {
        await db.insert(users).values({ id: provider, name: `test-${provider}`, email, provider });
      }

      // Act
      const user = await adapter.getUserByEmail?.(email);

      // Assert
      expect(user).toBeNull();
    },
  );

  test("createAdapter getUserByEmail should throw error if provider is unknown", async () => {
    // Arrange
    const db = createDb();
    const adapter = createAdapter(db, "unknown");
    const email = "test@example.com";

    // Act
    const actAsync = async () => await adapter.getUserByEmail?.(email);

    // Assert
    await expect(actAsync()).rejects.toThrow("Unable to get user by email for unknown provider");
  });
});
