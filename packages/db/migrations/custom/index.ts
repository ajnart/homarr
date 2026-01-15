import type { Database } from "../..";
import { migrateReleaseWidgetProviderToOptionsAsync } from "./0000_release_widget_provider_to_options";
import { migrateOpnsenseCredentialsAsync } from "./0001_opnsense_credentials";
import { migrateAppWidgetShowDescriptionTooltipToDisplayModeAsync } from "./0002_app_widget_show_description_tooltip_to_display_mode";

export const applyCustomMigrationsAsync = async (db: Database) => {
  await migrateReleaseWidgetProviderToOptionsAsync(db);
  await migrateOpnsenseCredentialsAsync(db);
  await migrateAppWidgetShowDescriptionTooltipToDisplayModeAsync(db);
};
