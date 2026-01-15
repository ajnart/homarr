import { createId } from "@homarr/common";
import { decryptSecretWithKey } from "@homarr/common/server";
import type { InferInsertModel } from "@homarr/db";
import type { users } from "@homarr/db/schema";

import type { OldmarrImportUser } from "../user-schema";

export const mapAndDecryptUsers = (importUsers: OldmarrImportUser[], encryptionToken: string | null) => {
  if (encryptionToken === null) {
    return [];
  }

  const key = Buffer.from(encryptionToken, "hex");

  return importUsers.map(
    ({
      id,
      password,
      salt,
      settings,
      ...user
    }): InferInsertModel<typeof users> & { oldId: string; isAdmin: boolean } => ({
      ...user,
      oldId: id,
      id: createId(),
      name: user.name.toLowerCase(),
      colorScheme: settings?.colorScheme === "environment" ? undefined : settings?.colorScheme,
      firstDayOfWeek: settings?.firstDayOfWeek === "sunday" ? 0 : settings?.firstDayOfWeek === "monday" ? 1 : 6,
      provider: "credentials",
      pingIconsEnabled: settings?.replacePingWithIcons,
      isAdmin: user.isAdmin || user.isOwner,
      password: decryptSecretWithKey(password, key),
      salt: decryptSecretWithKey(salt, key),
    }),
  );
};
