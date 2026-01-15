import SuperJSON from "superjson";

import { createId } from "@homarr/common";
import type { IntegrationKind } from "@homarr/definitions";
import { getIntegrationKindsByCategory } from "@homarr/definitions";

import { eq } from "../..";
import type { Database } from "../..";
import { items } from "../../schema";

export async function migrateReleaseWidgetProviderToOptionsAsync(db: Database) {
  const existingItems = await db.query.items.findMany({
    where: (items, { eq }) => eq(items.kind, "releases"),
  });

  const integrationKinds = getIntegrationKindsByCategory("releasesProvider");
  const providerIntegrations = await db.query.integrations.findMany({
    where: (integrations, { inArray }) => inArray(integrations.kind, integrationKinds),
    columns: {
      id: true,
      kind: true,
    },
  });

  const providerIntegrationMap = new Map<IntegrationKind, string>(
    providerIntegrations.map((integration) => [integration.kind, integration.id]),
  );

  const updates: {
    id: string;
    options: object;
  }[] = [];
  for (const item of existingItems) {
    const options = SuperJSON.parse<object>(item.options);
    if (!("repositories" in options)) continue;
    if (!Array.isArray(options.repositories)) continue;
    if (options.repositories.length === 0) continue;
    if (!options.repositories.some((repository) => "providerKey" in repository)) continue;

    const updatedRepositories = options.repositories.map(
      ({ providerKey, ...otherFields }: { providerKey: string; [key: string]: unknown }) => {
        // Ensure providerKey is camelCase
        const provider = providerKey.charAt(0).toLowerCase() + providerKey.slice(1);

        return {
          id: createId(),
          providerIntegrationId: providerIntegrationMap.get(provider as IntegrationKind) ?? null,
          ...otherFields,
        };
      },
    );

    updates.push({
      id: item.id,
      options: {
        ...options,
        repositories: updatedRepositories,
      },
    });
  }

  for (const update of updates) {
    await db
      .update(items)
      .set({
        options: SuperJSON.stringify(update.options),
      })
      .where(eq(items.id, update.id));
  }

  console.log(`Migrated release widget providers to integrations count="${updates.length}"`);
}
