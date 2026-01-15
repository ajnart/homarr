import { run } from "@drizzle-team/brocli";

import { fixUsernames } from "./commands/fix-usernames";
import { recreateAdmin } from "./commands/recreate-admin";
import { resetPassword } from "./commands/reset-password";

const commands = [resetPassword, fixUsernames, recreateAdmin];

void run(commands, {
  name: "homarr-cli",
  version: "1.0.0",
});
