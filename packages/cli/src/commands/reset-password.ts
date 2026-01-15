import { command, string } from "@drizzle-team/brocli";

import { hashPasswordAsync } from "@homarr/auth";
import { generateSecureRandomToken } from "@homarr/common/server";
import { and, db, eq } from "@homarr/db";
import { sessions, users } from "@homarr/db/schema";

export const resetPassword = command({
  name: "reset-password",
  desc: "Reset password for a user",
  options: {
    username: string("username").required().alias("u").desc("Name of the user"),
  },
  // eslint-disable-next-line no-restricted-syntax
  handler: async (options) => {
    if (!process.env.AUTH_PROVIDERS?.toLowerCase().includes("credentials")) {
      console.error("Credentials provider is not enabled");
      return;
    }

    const user = await db.query.users.findFirst({
      where: and(eq(users.name, options.username), eq(users.provider, "credentials")),
    });

    if (!user?.salt) {
      console.error(`User ${options.username} not found`);
      return;
    }

    // Generates a new password with 48 characters
    const newPassword = generateSecureRandomToken(24);

    await db
      .update(users)
      .set({
        password: await hashPasswordAsync(newPassword, user.salt),
      })
      .where(eq(users.id, user.id));

    await db.delete(sessions).where(eq(sessions.userId, user.id));
    console.log(`All sessions for user ${options.username} have been deleted`);

    console.log("You can now login with the new password");
    console.log(`New password for user ${options.username}: ${newPassword}`);
  },
});
