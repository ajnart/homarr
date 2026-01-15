import type { Session } from "next-auth";
import { describe, expect, test, vi } from "vitest";

import { createId } from "@homarr/common";
import type { InferInsertModel } from "@homarr/db";
import { boardGroupPermissions, boards, boardUserPermissions, groupMembers, groups, users } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";

import * as integrationPermissions from "../integration-permissions";
import { hasQueryAccessToIntegrationsAsync } from "../integration-query-permissions";

const createSession = (user: Partial<Session["user"]>): Session => ({
  user: {
    id: "1",
    permissions: [],
    colorScheme: "light",
    ...user,
  },
  expires: new Date().toISOString(),
});

describe("hasQueryAccessToIntegrationsAsync should check if the user has query access to the specified integrations", () => {
  test("should return true if the user has the board-view-all permission and the integrations are used anywhere", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({
      permissions: ["board-view-all"],
    });
    const integrations = [
      {
        id: "1",
        items: [{ item: { boardId: "1" } }],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [{ item: { boardId: "2" } }],
        userPermissions: [],
        groupPermissions: [],
      },
    ];

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(true);
  });

  test("should return true if the user has the board-view-all permission, the first integration is used and the second one he has use access", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({
      permissions: ["board-view-all"],
    });
    const spy = vi.spyOn(integrationPermissions, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: true,
    });
    const integrations = [
      {
        id: "1",
        items: [{ item: { boardId: "1" } }],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [],
        userPermissions: [],
        groupPermissions: [],
      },
    ];

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(true);
  });

  test("should return true if the user has use access to all integrations", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    const spy = vi.spyOn(integrationPermissions, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: true,
    });
    const integrations = [
      {
        id: "1",
        items: [],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [],
        userPermissions: [],
        groupPermissions: [],
      },
    ];

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(true);
  });

  test("should return true if the user has user permission to access to at least one board of each integration", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    await db.insert(users).values({ id: session.user.id });
    const spy = vi.spyOn(integrationPermissions, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: false,
    });
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
          {
            item: {
              boardId: "2",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1" }));
    await db.insert(boardUserPermissions).values({ userId: session.user.id, boardId: "1", permission: "view" });

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(true);
  });

  test("should return false if the user has user permission to access board of first integration but not of second one", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    await db.insert(users).values({ id: session.user.id });
    const spy = vi.spyOn(integrationPermissions, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: false,
    });
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "2",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1" }));
    await db.insert(boardUserPermissions).values({ userId: session.user.id, boardId: "1", permission: "view" });

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(false);
  });

  test("should return true if the user has group permission to access to at least one board of each integration", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    await db.insert(users).values({ id: session.user.id });
    const spy = vi.spyOn(integrationPermissions, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: false,
    });
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
          {
            item: {
              boardId: "2",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1" }));
    await db.insert(groups).values({ id: "1", name: "", position: 1 });
    await db.insert(groupMembers).values({ userId: session.user.id, groupId: "1" });
    await db.insert(boardGroupPermissions).values({ groupId: "1", boardId: "1", permission: "view" });

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(true);
  });

  test("should return false if the user has group permission to access board of first integration but not of second one", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    await db.insert(users).values({ id: session.user.id });
    const spy = vi.spyOn(integrationPermissions, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: false,
    });
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "2",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1" }));
    await db.insert(groups).values({ id: "1", name: "", position: 1 });
    await db.insert(groupMembers).values({ userId: session.user.id, groupId: "1" });
    await db.insert(boardGroupPermissions).values({ groupId: "1", boardId: "1", permission: "view" });

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(false);
  });

  test("should return true if the user has user permission to access first board and group permission to access second one", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    await db.insert(users).values({ id: session.user.id });
    const spy = vi.spyOn(integrationPermissions, "constructIntegrationPermissions");
    spy.mockReturnValue({
      hasFullAccess: false,
      hasInteractAccess: false,
      hasUseAccess: false,
    });
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "2",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1" }));
    await db.insert(boards).values(createMockBoard({ id: "2" }));
    await db.insert(groups).values({ id: "1", name: "", position: 1 });
    await db.insert(groupMembers).values({ userId: session.user.id, groupId: "1" });
    await db.insert(boardGroupPermissions).values({ groupId: "1", boardId: "2", permission: "view" });
    await db.insert(boardUserPermissions).values({ userId: session.user.id, boardId: "1", permission: "view" });

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(true);
  });

  test("should return true if one of the boards the integration is used is public", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "2",
            },
          },
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1", isPublic: true }));

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(true);
  });

  test("should return true if the user is creator of the board the integration is used", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    await db.insert(users).values({ id: session.user.id });
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "2",
            },
          },
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1", creatorId: session.user.id }));

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(true);
  });

  test("should return false if the user has no access to any of the integrations", async () => {
    // Arrange
    const db = createDb();
    const session = createSession({});
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "2",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

    // Assert
    expect(result).toBe(false);
  });

  test("should return false if the user is anonymous and the board is not public", async () => {
    // Arrange
    const db = createDb();
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "2",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1" }));

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, null);

    // Assert
    expect(result).toBe(false);
  });

  test("should return true if the user is anonymous and the board is public", async () => {
    // Arrange
    const db = createDb();
    const integrations = [
      {
        id: "1",
        items: [
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
      {
        id: "2",
        items: [
          {
            item: {
              boardId: "2",
            },
          },
          {
            item: {
              boardId: "1",
            },
          },
        ],
        userPermissions: [],
        groupPermissions: [],
      },
    ];
    await db.insert(boards).values(createMockBoard({ id: "1", isPublic: true }));

    // Act
    const result = await hasQueryAccessToIntegrationsAsync(db, integrations, null);

    // Assert
    expect(result).toBe(true);
  });
});

const createMockBoard = (board: Partial<InferInsertModel<typeof boards>>): InferInsertModel<typeof boards> => ({
  id: createId(),
  name: board.id ?? createId(),
  ...board,
});
