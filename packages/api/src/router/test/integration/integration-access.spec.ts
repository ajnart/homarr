import { describe, expect, test, vi } from "vitest";

import * as authShared from "@homarr/auth/shared";
import { createId } from "@homarr/common";
import { eq } from "@homarr/db";
import { integrations, users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";

import { throwIfActionForbiddenAsync } from "../../integration/integration-access";

const defaultCreatorId = createId();

const expectActToBeAsync = async (act: () => Promise<void>, success: boolean) => {
  if (!success) {
    await expect(act()).rejects.toThrow("Integration not found");
    return;
  }

  await expect(act()).resolves.toBeUndefined();
};

describe("throwIfActionForbiddenAsync should check access to integration and return boolean", () => {
  test.each([
    ["full" as const, true],
    ["interact" as const, true],
    ["use" as const, true],
  ])("with permission %s should return %s when hasFullAccess is true", async (permission, expectedResult) => {
    // Arrange
    const db = createDb();
    const spy = vi.spyOn(authShared, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: true,
      hasInteractAccess: false,
      hasUseAccess: false,
    });

    const integrationId = createId();
    await db.insert(integrations).values({
      id: integrationId,
      name: "test",
      kind: "adGuardHome",
      url: "http://localhost:3000",
    });

    // Act
    const act = () =>
      throwIfActionForbiddenAsync({ db, session: null }, eq(integrations.id, integrationId), permission);

    // Assert
    await expectActToBeAsync(act, expectedResult);
  });

  test.each([
    ["full" as const, false],
    ["interact" as const, true],
    ["use" as const, true],
  ])("with permission %s should return %s when hasInteractAccess is true", async (permission, expectedResult) => {
    // Arrange
    const db = createDb();
    const spy = vi.spyOn(authShared, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: true,
      hasUseAccess: false,
    });

    await db.insert(users).values({ id: defaultCreatorId });
    const integrationId = createId();
    await db.insert(integrations).values({
      id: integrationId,
      name: "test",
      kind: "adGuardHome",
      url: "http://localhost:3000",
    });

    // Act
    const act = () =>
      throwIfActionForbiddenAsync({ db, session: null }, eq(integrations.id, integrationId), permission);

    // Assert
    await expectActToBeAsync(act, expectedResult);
  });

  test.each([
    ["full" as const, false],
    ["interact" as const, false],
    ["use" as const, true],
  ])("with permission %s should return %s when hasUseAccess is true", async (permission, expectedResult) => {
    // Arrange
    const db = createDb();
    const spy = vi.spyOn(authShared, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: true,
    });

    await db.insert(users).values({ id: defaultCreatorId });
    const integrationId = createId();
    await db.insert(integrations).values({
      id: integrationId,
      name: "test",
      kind: "adGuardHome",
      url: "http://localhost:3000",
    });

    // Act
    const act = () =>
      throwIfActionForbiddenAsync({ db, session: null }, eq(integrations.id, integrationId), permission);

    // Assert
    await expectActToBeAsync(act, expectedResult);
  });

  test.each([
    ["full" as const, false],
    ["interact" as const, false],
    ["use" as const, false],
  ])("with permission %s should return %s when hasUseAccess is false", async (permission, expectedResult) => {
    // Arrange
    const db = createDb();
    const spy = vi.spyOn(authShared, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: false,
    });

    await db.insert(users).values({ id: defaultCreatorId });
    const integrationId = createId();
    await db.insert(integrations).values({
      id: integrationId,
      name: "test",
      kind: "adGuardHome",
      url: "http://localhost:3000",
    });

    // Act
    const act = () =>
      throwIfActionForbiddenAsync({ db, session: null }, eq(integrations.id, integrationId), permission);

    // Assert
    await expectActToBeAsync(act, expectedResult);
  });

  test("should throw when integration is not found", async () => {
    // Arrange
    const db = createDb();

    // Act
    const act = () => throwIfActionForbiddenAsync({ db, session: null }, eq(integrations.id, createId()), "full");

    // Assert
    await expect(act()).rejects.toThrow("Integration not found");
  });
});
