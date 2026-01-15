import { createSelectSchema } from "drizzle-zod";

import { apps, boards, groups, invites, searchEngines, serverSettings, users } from "./schema";

export const selectAppSchema = createSelectSchema(apps);
export const selectBoardSchema = createSelectSchema(boards);
export const selectGroupSchema = createSelectSchema(groups);
export const selectInviteSchema = createSelectSchema(invites);
export const selectSearchEnginesSchema = createSelectSchema(searchEngines);
export const selectSeverSettingsSchema = createSelectSchema(serverSettings);
export const selectUserSchema = createSelectSchema(users);
