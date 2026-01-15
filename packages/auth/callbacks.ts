import dayjs from "dayjs";
import type { NextAuthConfig } from "next-auth";

import type { Session } from "@homarr/auth";
import type { Database } from "@homarr/db";
import { eq, inArray } from "@homarr/db";
import { groupMembers, groupPermissions, users } from "@homarr/db/schema";
import { getPermissionsWithChildren } from "@homarr/definitions";

export const getCurrentUserPermissionsAsync = async (db: Database, userId: string) => {
  const dbGroupMembers = await db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, userId),
  });
  const groupIds = dbGroupMembers.map((groupMember) => groupMember.groupId);

  if (groupIds.length === 0) return [];

  const dbGroupPermissions = await db
    .selectDistinct({
      permission: groupPermissions.permission,
    })
    .from(groupPermissions)
    .where(inArray(groupPermissions.groupId, groupIds));
  const permissionKeys = dbGroupPermissions.map(({ permission }) => permission);

  return getPermissionsWithChildren(permissionKeys);
};

export const createSessionAsync = async (
  db: Database,
  user: { id: string; email: string | null },
): Promise<Session> => {
  return {
    expires: dayjs().add(1, "day").toISOString(),
    user: {
      ...user,
      email: user.email ?? "",
      permissions: await getCurrentUserPermissionsAsync(db, user.id),
      colorScheme: "dark",
    },
  } as Session;
};

export const createSessionCallback = (db: Database): NextAuthCallbackOf<"session"> => {
  return async ({ session, user }) => {
    const additionalProperties = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        colorScheme: true,
      },
    });

    return {
      ...session,
      user: {
        ...session.user,
        ...additionalProperties,
        id: user.id,
        name: user.name,
        permissions: await getCurrentUserPermissionsAsync(db, user.id),
      },
    };
  };
};

type NextAuthCallbackRecord = Exclude<NextAuthConfig["callbacks"], undefined>;
export type NextAuthCallbackOf<TKey extends keyof NextAuthCallbackRecord> = Exclude<
  NextAuthCallbackRecord[TKey],
  undefined
>;
