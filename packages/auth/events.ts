import { cookies } from "next/headers";
import dayjs from "dayjs";
import type { NextAuthConfig } from "next-auth";

import { createLogger } from "@homarr/core/infrastructure/logs";
import { and, eq, inArray } from "@homarr/db";
import type { Database } from "@homarr/db";
import { groupMembers, groups, users } from "@homarr/db/schema";
import { colorSchemeCookieKey, everyoneGroup } from "@homarr/definitions";

import { env } from "./env";
import { extractProfileName } from "./providers/oidc/oidc-provider";

const logger = createLogger({ module: "authEvents" });

export const createSignInEventHandler = (db: Database): Exclude<NextAuthConfig["events"], undefined>["signIn"] => {
  return async ({ user, profile }) => {
    logger.debug(`SignIn EventHandler for user: ${JSON.stringify(user)} . profile: ${JSON.stringify(profile)}`);
    if (!user.id) throw new Error("User ID is missing");

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        name: true,
        image: true,
        colorScheme: true,
      },
    });

    if (!dbUser) throw new Error("User not found");

    const groupsKey = env.AUTH_OIDC_GROUPS_ATTRIBUTE;
    // Groups from oidc provider are provided from the profile, it's not typed.
    if (profile && groupsKey in profile && Array.isArray(profile[groupsKey])) {
      logger.debug(`Using profile groups (${groupsKey}): ${JSON.stringify(profile[groupsKey])}`);
      await synchronizeGroupsWithExternalForUserAsync(db, user.id, profile[groupsKey] as string[]);
    }

    // In ldap-authroization we return the groups from ldap, it's not typed.
    if ("groups" in user && Array.isArray(user.groups)) {
      logger.debug(`Using profile groups: ${JSON.stringify(user.groups)}`);
      await synchronizeGroupsWithExternalForUserAsync(db, user.id, user.groups as string[]);
    }
    await addUserToEveryoneGroupIfNotMemberAsync(db, user.id);

    if (dbUser.name !== user.name) {
      await db.update(users).set({ name: user.name }).where(eq(users.id, user.id));
      logger.info("Username for user of credentials provider has changed.", {
        userId: user.id,
        oldName: dbUser.name,
        newName: user.name,
      });
    }

    if (profile) {
      const profileUsername = extractProfileName(profile);
      if (!profileUsername) {
        throw new Error(`OIDC provider did not return a name properties='${Object.keys(profile).join(",")}'`);
      }

      if (dbUser.name !== profileUsername) {
        await db.update(users).set({ name: profileUsername }).where(eq(users.id, user.id));
        logger.info("Username for user of oidc provider has changed.", {
          userId: user.id,
          oldName: dbUser.name,
          newName: profileUsername,
        });
      }

      if (
        typeof profile.picture === "string" &&
        dbUser.image !== profile.picture &&
        !dbUser.image?.startsWith("data:")
      ) {
        await db.update(users).set({ image: profile.picture }).where(eq(users.id, user.id));
        logger.info("Profile picture for user of oidc provider has changed.", {
          userId: user.id,
        });
      }
    }

    logger.info("User logged in", { userId: user.id, userName: dbUser.name, timestamp: dayjs().format() });

    // We use a cookie as localStorage is not shared with server (otherwise flickering would occur)
    (await cookies()).set(colorSchemeCookieKey, dbUser.colorScheme, {
      path: "/",
      expires: dayjs().add(1, "year").toDate(),
    });
  };
};

const addUserToEveryoneGroupIfNotMemberAsync = async (db: Database, userId: string) => {
  const dbEveryoneGroup = await db.query.groups.findFirst({
    where: eq(groups.name, everyoneGroup),
    with: {
      members: {
        where: eq(groupMembers.userId, userId),
      },
    },
  });

  if (dbEveryoneGroup?.members.length === 0) {
    await db.insert(groupMembers).values({
      userId,
      groupId: dbEveryoneGroup.id,
    });
    logger.info("Added user to everyone group.", { userId });
  }
};

const synchronizeGroupsWithExternalForUserAsync = async (db: Database, userId: string, externalGroups: string[]) => {
  const ignoredGroups = [everyoneGroup];
  const dbGroupMembers = await db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, userId),
    with: {
      group: { columns: { name: true } },
    },
  });

  /**
   * The below groups are those groups the user is part of in the external system, but not in Homarr.
   * So he has to be added to those groups.
   */
  const missingExternalGroupsForUser = externalGroups.filter(
    (externalGroup) => !dbGroupMembers.some(({ group }) => group.name === externalGroup),
  );

  if (missingExternalGroupsForUser.length > 0) {
    logger.debug("Homarr does not have the user in certain groups.", {
      user: userId,
      count: missingExternalGroupsForUser.length,
    });

    const groupIds = await db.query.groups.findMany({
      columns: {
        id: true,
      },
      where: inArray(groups.name, missingExternalGroupsForUser),
    });

    logger.debug("Homarr has found groups in the database user is not in.", {
      user: userId,
      count: groupIds.length,
    });

    if (groupIds.length > 0) {
      await db.insert(groupMembers).values(
        groupIds.map((group) => ({
          userId,
          groupId: group.id,
        })),
      );

      logger.info("Added user to groups successfully.", { user: userId, count: groupIds.length });
    } else {
      logger.debug("User is already in all groups of Homarr.", { user: userId });
    }
  }

  /**
   * The below groups are those groups the user is part of in Homarr, but not in the external system and not ignored.
   * So he has to be removed from those groups.
   */
  const groupsUserIsNoLongerMemberOfExternally = dbGroupMembers.filter(
    ({ group }) => !externalGroups.concat(ignoredGroups).includes(group.name),
  );

  if (groupsUserIsNoLongerMemberOfExternally.length > 0) {
    logger.debug("Homarr has the user in certain groups that LDAP does not have.", {
      user: userId,
      count: groupsUserIsNoLongerMemberOfExternally.length,
    });

    await db.delete(groupMembers).where(
      and(
        eq(groupMembers.userId, userId),
        inArray(
          groupMembers.groupId,
          groupsUserIsNoLongerMemberOfExternally.map(({ groupId }) => groupId),
        ),
      ),
    );

    logger.info("Removed user from groups successfully.", {
      user: userId,
      count: groupsUserIsNoLongerMemberOfExternally.length,
    });
  }
};
