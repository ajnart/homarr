import type { Session } from "next-auth";
import { describe, expect, test } from "vitest";

import { getPermissionsWithChildren } from "@homarr/definitions";

import { constructIntegrationPermissions } from "../integration-permissions";

describe("constructIntegrationPermissions", () => {
  test("should return hasFullAccess as true when session permissions include integration-full-all", () => {
    // Arrange
    const integration = {
      userPermissions: [],
      groupPermissions: [],
    };
    const session = {
      user: {
        id: "2",
        permissions: getPermissionsWithChildren(["integration-full-all"]),
        colorScheme: "light",
      },
      expires: new Date().toISOString(),
    } satisfies Session;

    // Act
    const result = constructIntegrationPermissions(integration, session);

    // Assert
    expect(result.hasFullAccess).toBe(true);
    expect(result.hasInteractAccess).toBe(true);
    expect(result.hasUseAccess).toBe(true);
  });

  test("should return hasInteractAccess as true when session permissions include integration-interact-all", () => {
    // Arrange
    const integration = {
      userPermissions: [],
      groupPermissions: [],
    };
    const session = {
      user: {
        id: "2",
        permissions: getPermissionsWithChildren(["integration-interact-all"]),
        colorScheme: "light",
      },
      expires: new Date().toISOString(),
    } satisfies Session;

    // Act
    const result = constructIntegrationPermissions(integration, session);

    // Assert
    expect(result.hasFullAccess).toBe(false);
    expect(result.hasInteractAccess).toBe(true);
    expect(result.hasUseAccess).toBe(true);
  });

  test('should return hasInteractAccess as true when integration user permissions include "interact"', () => {
    // Arrange
    const integration = {
      userPermissions: [{ permission: "interact" as const }],
      groupPermissions: [],
    };
    const session = {
      user: {
        id: "2",
        permissions: [],
        colorScheme: "light",
      },
      expires: new Date().toISOString(),
    } satisfies Session;

    // Act
    const result = constructIntegrationPermissions(integration, session);

    // Assert
    expect(result.hasFullAccess).toBe(false);
    expect(result.hasInteractAccess).toBe(true);
    expect(result.hasUseAccess).toBe(true);
  });

  test("should return hasInteractAccess as true when integration group permissions include interact", () => {
    // Arrange
    const integration = {
      userPermissions: [],
      groupPermissions: [{ permission: "interact" as const }],
    };
    const session = {
      user: {
        id: "2",
        permissions: [],
        colorScheme: "light",
      },
      expires: new Date().toISOString(),
    } satisfies Session;

    // Act
    const result = constructIntegrationPermissions(integration, session);

    // Assert
    expect(result.hasFullAccess).toBe(false);
    expect(result.hasInteractAccess).toBe(true);
    expect(result.hasUseAccess).toBe(true);
  });

  test("should return hasUseAccess as true when session permissions include integration-use-all", () => {
    // Arrange
    const integration = {
      userPermissions: [],
      groupPermissions: [],
    };
    const session = {
      user: {
        id: "2",
        permissions: getPermissionsWithChildren(["integration-use-all"]),
        colorScheme: "light",
      },
      expires: new Date().toISOString(),
    } satisfies Session;

    // Act
    const result = constructIntegrationPermissions(integration, session);

    // Assert
    expect(result.hasFullAccess).toBe(false);
    expect(result.hasInteractAccess).toBe(false);
    expect(result.hasUseAccess).toBe(true);
  });

  test("should return hasUseAccess as true when integration user permissions length is greater than or equal to 1", () => {
    // Arrange
    const integration = {
      userPermissions: [{ permission: "use" as const }],
      groupPermissions: [],
    };
    const session = {
      user: {
        id: "2",
        permissions: [],
        colorScheme: "light",
      },
      expires: new Date().toISOString(),
    } satisfies Session;

    // Act
    const result = constructIntegrationPermissions(integration, session);

    // Assert
    expect(result.hasFullAccess).toBe(false);
    expect(result.hasInteractAccess).toBe(false);
    expect(result.hasUseAccess).toBe(true);
  });

  test("should return hasUseAccess as true when integration group permissions length is greater than or equal to 1", () => {
    // Arrange
    const integration = {
      userPermissions: [],
      groupPermissions: [{ permission: "use" as const }],
    };
    const session = {
      user: {
        id: "2",
        permissions: [],
        colorScheme: "light",
      },
      expires: new Date().toISOString(),
    } satisfies Session;

    // Act
    const result = constructIntegrationPermissions(integration, session);

    // Assert
    expect(result.hasFullAccess).toBe(false);
    expect(result.hasInteractAccess).toBe(false);
    expect(result.hasUseAccess).toBe(true);
  });

  test("should return all false when integration no permissions", () => {
    // Arrange
    const integration = {
      userPermissions: [],
      groupPermissions: [],
    };
    const session = {
      user: {
        id: "2",
        permissions: [],
        colorScheme: "light",
      },
      expires: new Date().toISOString(),
    } satisfies Session;

    // Act
    const result = constructIntegrationPermissions(integration, session);

    // Assert
    expect(result.hasFullAccess).toBe(false);
    expect(result.hasInteractAccess).toBe(false);
    expect(result.hasUseAccess).toBe(false);
  });
});
