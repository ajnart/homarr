import SuperJSON from "superjson";

import type { ServerSettings } from "@homarr/server-settings";
import { defaultServerSettings, defaultServerSettingsKeys } from "@homarr/server-settings";

import type { Database } from "..";
import { eq } from "..";
import { serverSettings } from "../schema";

export const getServerSettingsAsync = async (db: Database) => {
  const settings = await db.query.serverSettings.findMany();

  return defaultServerSettingsKeys.reduce((acc, settingKey) => {
    const setting = settings.find((setting) => setting.settingKey === settingKey);
    if (!setting) {
      // Typescript is not happy because the key is a union and it does not know that they are the same
      acc[settingKey] = defaultServerSettings[settingKey] as never;
      return acc;
    }

    acc[settingKey] = {
      ...defaultServerSettings[settingKey],
      ...SuperJSON.parse(setting.value),
    };
    return acc;
  }, {} as ServerSettings);
};

export const getServerSettingByKeyAsync = async <TKey extends keyof ServerSettings>(db: Database, key: TKey) => {
  const dbSettings = await db.query.serverSettings.findFirst({
    where: eq(serverSettings.settingKey, key),
  });

  if (!dbSettings) {
    return defaultServerSettings[key];
  }

  return SuperJSON.parse<ServerSettings[TKey]>(dbSettings.value);
};

export const updateServerSettingByKeyAsync = async <TKey extends keyof ServerSettings>(
  db: Database,
  key: TKey,
  value: ServerSettings[TKey],
) => {
  await db
    .update(serverSettings)
    .set({
      value: SuperJSON.stringify(value),
    })
    .where(eq(serverSettings.settingKey, key));
};

export const insertServerSettingByKeyAsync = async <TKey extends keyof ServerSettings>(
  db: Database,
  key: TKey,
  value: ServerSettings[TKey],
) => {
  await db.insert(serverSettings).values({
    settingKey: key,
    value: SuperJSON.stringify(value),
  });
};
