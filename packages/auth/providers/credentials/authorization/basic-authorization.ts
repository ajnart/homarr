import bcrypt from "bcrypt";
import type { z } from "zod/v4";

import { createLogger } from "@homarr/core/infrastructure/logs";
import type { Database } from "@homarr/db";
import { and, eq } from "@homarr/db";
import { users } from "@homarr/db/schema";
import type { userSignInSchema } from "@homarr/validation/user";

const logger = createLogger({ module: "basicAuthorization" });

export const authorizeWithBasicCredentialsAsync = async (
  db: Database,
  credentials: z.infer<typeof userSignInSchema>,
) => {
  const user = await db.query.users.findFirst({
    where: and(eq(users.name, credentials.name.toLowerCase()), eq(users.provider, "credentials")),
  });

  if (!user?.password) {
    logger.info("User not found", { userName: credentials.name });
    return null;
  }

  logger.info("User is trying to log in. Checking password...", { userName: user.name });
  const isValidPassword = await bcrypt.compare(credentials.password, user.password);

  if (!isValidPassword) {
    logger.warn("Password for user was incorrect", { userName: user.name });
    return null;
  }

  logger.info("User successfully authorized", { userName: user.name });

  return {
    id: user.id,
    name: user.name,
  };
};
