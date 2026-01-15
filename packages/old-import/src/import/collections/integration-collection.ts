import { encryptSecret } from "@homarr/common/server";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { createDbInsertCollectionForTransaction } from "@homarr/db/collection";

import { mapAndDecryptIntegrations } from "../../mappers/map-integration";
import type { PreparedIntegration } from "../../prepare/prepare-integrations";

const logger = createLogger({ module: "integrationCollection" });

export const createIntegrationInsertCollection = (
  preparedIntegrations: PreparedIntegration[],
  encryptionToken: string | null | undefined,
) => {
  const insertCollection = createDbInsertCollectionForTransaction(["integrations", "integrationSecrets"]);

  if (preparedIntegrations.length === 0) {
    return insertCollection;
  }

  logger.info("Preparing integrations for insert collection", { count: preparedIntegrations.length });

  if (encryptionToken === null || encryptionToken === undefined) {
    logger.debug("Skipping integration decryption due to missing token");
    return insertCollection;
  }

  const preparedIntegrationsDecrypted = mapAndDecryptIntegrations(preparedIntegrations, encryptionToken);

  preparedIntegrationsDecrypted.forEach((integration) => {
    insertCollection.integrations.push({
      id: integration.id,
      kind: integration.kind,
      name: integration.name,
      url: integration.url,
    });

    integration.secrets
      .filter((secret) => secret.value !== null)
      .forEach((secret) => {
        insertCollection.integrationSecrets.push({
          integrationId: integration.id,
          kind: secret.field,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          value: encryptSecret(secret.value!),
        });
      });
  });

  logger.info("Added integrations and secrets to insert collection", {
    integrationCount: insertCollection.integrations.length,
    secretCount: insertCollection.integrationSecrets.length,
  });

  return insertCollection;
};
