import { command } from "@drizzle-team/brocli";

import { db, eq } from "@homarr/db";
import { users } from "@homarr/db/schema";

export const fixUsernames = command({
  name: "fix-usernames",
  desc: "Changes all credentials usernames to lowercase",
  // eslint-disable-next-line no-restricted-syntax
  handler: async () => {
    if (!process.env.AUTH_PROVIDERS?.toLowerCase().includes("credentials")) {
      console.error("Credentials provider is not enabled");
      return;
    }

    const credentialUsers = await db.query.users.findMany({
      where: eq(users.provider, "credentials"),
    });

    for (const user of credentialUsers) {
      if (!user.name) continue;
      if (user.name === user.name.toLowerCase()) continue;

      await db
        .update(users)
        .set({
          name: user.name.toLowerCase(),
        })
        .where(eq(users.id, user.id));

      console.log(`Changed username from ${user.name} to ${user.name.toLowerCase()}`);
    }

    console.log("All usernames have been fixed");
  },
});
