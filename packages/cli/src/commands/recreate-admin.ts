import { command, string } from "@drizzle-team/brocli";

import { createSaltAsync, hashPasswordAsync } from "@homarr/auth";
import { createId } from "@homarr/common";
import { generateSecureRandomToken } from "@homarr/common/server";
import { and, count, db, eq } from "@homarr/db";
import { getMaxGroupPositionAsync } from "@homarr/db/queries";
import { groupMembers, groupPermissions, groups, users } from "@homarr/db/schema";
import { usernameSchema } from "@homarr/validation/user";

export const recreateAdmin = command({
  name: "recreate-admin",
  desc: "Recreate credentials admin user if none exists anymore",
  options: {
    username: string("username").required().alias("u").desc("Name of the admin"),
  },
  // eslint-disable-next-line no-restricted-syntax
  handler: async (options) => {
    if (!process.env.AUTH_PROVIDERS?.toLowerCase().includes("credentials")) {
      console.error("Credentials provider is not enabled");
      return;
    }

    const result = await usernameSchema.safeParseAsync(options.username);

    if (!result.success) {
      console.error("Invalid username:");
      console.error(result.error.issues.map((error) => `- ${error.message}`).join("\n"));
      return;
    }

    const totalCount = await db
      .select({
        count: count(),
      })
      .from(groupPermissions)
      .leftJoin(groupMembers, eq(groupMembers.groupId, groupPermissions.groupId))
      .leftJoin(users, eq(users.id, groupMembers.userId))
      .where(and(eq(groupPermissions.permission, "admin"), eq(users.provider, "credentials")))
      .then((rows) => rows.at(0)?.count ?? 0);

    if (totalCount > 0) {
      console.error("Credentials admin user exists");
      return;
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.name, result.data),
    });

    if (existingUser) {
      console.error("User with this name already exists");
      return;
    }

    const temporaryGroupId = createId();

    const maxPosition = await getMaxGroupPositionAsync(db);
    await db.insert(groups).values({
      id: temporaryGroupId,
      name: temporaryGroupId,
      position: maxPosition + 1,
    });

    await db.insert(groupPermissions).values({
      groupId: temporaryGroupId,
      permission: "admin",
    });

    const salt = await createSaltAsync();
    const password = generateSecureRandomToken(24);
    const hashedPassword = await hashPasswordAsync(password, salt);

    const userId = createId();
    await db.insert(users).values({
      id: userId,
      name: result.data,
      provider: "credentials",
      password: hashedPassword,
      salt,
    });

    await db.insert(groupMembers).values({
      groupId: temporaryGroupId,
      userId,
    });

    console.log(
      "We created a new admin user for you. Please keep in mind, that the admin group of it has a temporary name. You should change it to something more meaningful.",
    );
    console.log(`\tUsername: ${result.data}`);
    console.log(`\tPassword: ${password}`);
    console.log(`\tGroup: ${temporaryGroupId}`);
    console.log(""); // Empty line for better readability
  },
});
