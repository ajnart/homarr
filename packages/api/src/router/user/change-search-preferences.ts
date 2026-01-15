import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type { Session } from "@homarr/auth";
import type { Modify } from "@homarr/common/types";
import { eq } from "@homarr/db";
import type { Database } from "@homarr/db";
import { users } from "@homarr/db/schema";
import { userChangeSearchPreferencesSchema } from "@homarr/validation/user";

export const changeSearchPreferencesInputSchema = userChangeSearchPreferencesSchema.and(
  z.object({ userId: z.string() }),
);

export const changeSearchPreferencesAsync = async (
  db: Database,
  session: Session,
  input: Modify<z.infer<typeof changeSearchPreferencesInputSchema>, { openInNewTab: boolean | undefined }>,
) => {
  const user = session.user;
  // Only admins can change other users passwords
  if (!user.permissions.includes("admin") && user.id !== input.userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const dbUser = await db.query.users.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.id, input.userId),
  });

  if (!dbUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  await db
    .update(users)
    .set({
      defaultSearchEngineId: input.defaultSearchEngineId,
      openSearchInNewTab: input.openInNewTab,
    })
    .where(eq(users.id, input.userId));
};
