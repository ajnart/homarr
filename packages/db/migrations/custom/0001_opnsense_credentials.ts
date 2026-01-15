import type { Database } from "../..";
import { and, eq } from "../..";
import { integrationSecrets } from "../../schema";

/**
 * Previously the credentials for OPNsense were stored as username and password.
 * However it should have been the api key and secret.
 * For more information see:
 * https://docs.opnsense.org/development/how-tos/api.html#creating-keys
 */
export async function migrateOpnsenseCredentialsAsync(db: Database) {
  const existingIntegrations = await db.query.integrations.findMany({
    where: (table, { eq }) => eq(table.kind, "opnsense"),
    with: {
      secrets: true,
    },
  });

  await Promise.all(
    existingIntegrations.map(async (integration) => {
      const username = integration.secrets.find((secret) => secret.kind === "username");
      if (!username) return;
      await db
        .update(integrationSecrets)
        .set({
          kind: "opnsenseApiKey",
        })
        .where(
          and(eq(integrationSecrets.integrationId, username.integrationId), eq(integrationSecrets.kind, "username")),
        );
    }),
  );

  await Promise.all(
    existingIntegrations.map(async (integration) => {
      const password = integration.secrets.find((secret) => secret.kind === "password");
      if (!password) return;
      await db
        .update(integrationSecrets)
        .set({
          kind: "opnsenseApiSecret",
        })
        .where(
          and(eq(integrationSecrets.integrationId, password.integrationId), eq(integrationSecrets.kind, "password")),
        );
    }),
  );

  if (existingIntegrations.length > 0) {
    console.log(`Migrated OPNsense credentials count="${existingIntegrations.length}"`);
  }
}
