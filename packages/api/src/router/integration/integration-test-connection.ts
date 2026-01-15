import { decryptSecret } from "@homarr/common/server";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import type { Integration } from "@homarr/db/schema";
import type { IntegrationKind, IntegrationSecretKind } from "@homarr/definitions";
import { getAllSecretKindOptions } from "@homarr/definitions";
import { createIntegrationAsync } from "@homarr/integrations";

const logger = createLogger({ module: "integrationTestConnection" });

type FormIntegration = Omit<Integration, "appId"> & {
  secrets: {
    kind: IntegrationSecretKind;
    value: string | null;
  }[];
};

export const testConnectionAsync = async (
  integration: FormIntegration,
  dbSecrets: {
    kind: IntegrationSecretKind;
    value: `${string}.${string}`;
  }[] = [],
) => {
  logger.info("Testing connection", {
    integrationName: integration.name,
    integrationKind: integration.kind,
    integrationUrl: integration.url,
  });

  const decryptedDbSecrets = dbSecrets
    .map((secret) => {
      try {
        return {
          ...secret,
          value: decryptSecret(secret.value),
          source: "db" as const,
        };
      } catch (error) {
        logger.warn(
          new ErrorWithMetadata(
            "Failed to decrypt secret from database",
            {
              integrationName: integration.name,
              integrationKind: integration.kind,
              secretKind: secret.kind,
            },
            { cause: error },
          ),
        );
        return null;
      }
    })
    .filter((secret) => secret !== null);

  const formSecrets = integration.secrets
    .map((secret) => ({
      ...secret,
      // If the value is not defined in the form (because we only changed other values) we use the existing value from the db if it exists
      value: secret.value ?? decryptedDbSecrets.find((dbSecret) => dbSecret.kind === secret.kind)?.value ?? null,
      source: "form" as const,
    }))
    .filter((secret): secret is SourcedIntegrationSecret<"form"> => secret.value !== null);

  const sourcedSecrets = [...formSecrets, ...decryptedDbSecrets];
  const secretKinds = getSecretKindOption(integration.kind, sourcedSecrets);

  const decryptedSecrets = secretKinds
    .map((kind) => {
      const secrets = sourcedSecrets.filter((secret) => secret.kind === kind);
      // Will never be undefined because of the check before
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (secrets.length === 1) return secrets[0]!;

      // There will always be a matching secret because of the getSecretKindOption function
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return secrets.find((secret) => secret.source === "form") ?? secrets[0]!;
    })
    .map(({ source: _, ...secret }) => secret);

  const { secrets: _, ...baseIntegration } = integration;

  const integrationInstance = await createIntegrationAsync({
    ...baseIntegration,
    decryptedSecrets,
    externalUrl: null,
  });

  const result = await integrationInstance.testConnectionAsync();
  if (result.success) {
    logger.info("Tested connection successfully", {
      integrationName: integration.name,
      integrationKind: integration.kind,
      integrationUrl: integration.url,
    });
  }
  return result;
};

interface SourcedIntegrationSecret<TSource extends string = "db" | "form"> {
  kind: IntegrationSecretKind;
  value: string;
  source: TSource;
}

const getSecretKindOption = (kind: IntegrationKind, sourcedSecrets: SourcedIntegrationSecret[]) => {
  const matchingSecretKindOptions = getAllSecretKindOptions(kind).filter((secretKinds) =>
    secretKinds.every((kind) => sourcedSecrets.some((secret) => secret.kind === kind)),
  );

  if (matchingSecretKindOptions.length === 0) {
    throw new MissingSecretError();
  }

  if (matchingSecretKindOptions.length === 1) {
    // Will never be undefined because of the check above
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return matchingSecretKindOptions[0]!;
  }

  const onlyFormSecretsKindOptions = matchingSecretKindOptions.filter((secretKinds) =>
    secretKinds.every((secretKind) =>
      sourcedSecrets.find((secret) => secret.kind === secretKind && secret.source === "form"),
    ),
  );

  if (onlyFormSecretsKindOptions.length >= 1) {
    // If the first option is no secret it would always be selected even if we want to have a secret
    if (
      onlyFormSecretsKindOptions.length >= 2 &&
      onlyFormSecretsKindOptions.some((secretKinds) => secretKinds.length === 0)
    ) {
      return (
        // Will never be undefined because of the check above
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onlyFormSecretsKindOptions.find((secretKinds) => secretKinds.length >= 1) ?? onlyFormSecretsKindOptions[0]!
      );
    }

    // Will never be undefined because of the check above
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return onlyFormSecretsKindOptions[0]!;
  }

  // Will never be undefined because of the check above
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return matchingSecretKindOptions[0]!;
};

export class MissingSecretError extends Error {
  constructor() {
    super("No secret defined for this integration");
  }
}
