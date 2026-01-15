import SuperJSON from "superjson";
import { describe, expect, test, vi } from "vitest";

import type { Session } from "@homarr/auth";
import { createId } from "@homarr/common";
import { serverSettings } from "@homarr/db/schema";
import { createDb } from "@homarr/db/test";
import { defaultServerSettings, defaultServerSettingsKeys } from "@homarr/server-settings";

import { serverSettingsRouter } from "../serverSettings";

// Mock the auth module to return an empty session
vi.mock("@homarr/auth", () => ({ auth: () => ({}) as Session }));

const defaultSession = {
  user: {
    id: createId(),
    permissions: ["admin"],
    colorScheme: "light",
  },
  expires: new Date().toISOString(),
} satisfies Session;

describe("getAll server settings", () => {
  test("getAll should throw error when unauthorized", async () => {
    const db = createDb();
    const caller = serverSettingsRouter.createCaller({
      db,
      deviceType: undefined,
      session: null,
    });

    await db.insert(serverSettings).values([
      {
        settingKey: defaultServerSettingsKeys[0],
        value: SuperJSON.stringify(defaultServerSettings.analytics),
      },
    ]);

    const actAsync = async () => await caller.getAll();

    await expect(actAsync()).rejects.toThrow();
  });
  test("getAll should return default server settings when nothing in database", async () => {
    const db = createDb();
    const caller = serverSettingsRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSession,
    });

    const result = await caller.getAll();

    expect(result).toStrictEqual(defaultServerSettings);
  });
});

describe("saveSettings", () => {
  test("saveSettings should update settings and return true when it updated only one", async () => {
    const db = createDb();
    const caller = serverSettingsRouter.createCaller({
      db,
      deviceType: undefined,
      session: defaultSession,
    });

    await db.insert(serverSettings).values([
      {
        settingKey: defaultServerSettingsKeys[0],
        value: SuperJSON.stringify(defaultServerSettings.analytics),
      },
    ]);

    await caller.saveSettings({
      settingsKey: "analytics",
      value: {
        enableGeneral: true,
        enableWidgetData: true,
        enableIntegrationData: true,
        enableUserData: true,
      },
    });

    const dbSettings = await db.select().from(serverSettings);
    expect(dbSettings).toStrictEqual([
      {
        settingKey: "analytics",
        value: SuperJSON.stringify({
          enableGeneral: true,
          enableWidgetData: true,
          enableIntegrationData: true,
          enableUserData: true,
        }),
      },
    ]);
  });
});
