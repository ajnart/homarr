import SuperJSON from "superjson";

import { eq } from "../..";
import type { Database } from "../..";
import { items } from "../../schema";

/**
 * To support showing the description in the widget itself we replaced
 * the tooltip show option with display mode.
 */
export async function migrateAppWidgetShowDescriptionTooltipToDisplayModeAsync(db: Database) {
  const existingAppItems = await db.query.items.findMany({
    where: (table, { eq }) => eq(table.kind, "app"),
  });

  const itemsToUpdate = existingAppItems
    .map((item) => ({
      id: item.id,
      options: SuperJSON.parse<{ showDescriptionTooltip?: boolean }>(item.options),
    }))
    .filter((item) => item.options.showDescriptionTooltip !== undefined);

  console.log(
    `Migrating app items with showDescriptionTooltip to descriptionDisplayMode count=${itemsToUpdate.length}`,
  );

  await Promise.all(
    itemsToUpdate.map(async (item) => {
      const { showDescriptionTooltip, ...options } = item.options;
      await db
        .update(items)
        .set({
          options: SuperJSON.stringify({
            ...options,
            descriptionDisplayMode: showDescriptionTooltip ? "tooltip" : "hidden",
          }),
        })
        .where(eq(items.id, item.id));
    }),
  );

  console.log(`Migrated app items with showDescriptionTooltip to descriptionDisplayMode count=${itemsToUpdate.length}`);
}
