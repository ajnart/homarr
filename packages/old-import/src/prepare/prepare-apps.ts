import type { InferSelectModel } from "@homarr/db";
import type { apps } from "@homarr/db/schema";
import type { OldmarrConfig } from "@homarr/old-schema";

import type { ValidAnalyseConfig } from "../analyse/types";
import { mapOldmarrApp, mapOldmarrBookmarkApp } from "../mappers/map-app";
import type { OldmarrBookmarkDefinition } from "../widgets/definitions/bookmark";

export type PreparedApp = Omit<InferSelectModel<typeof apps>, "id"> & { ids: string[]; existingId?: string };

export const prepareApps = (analyseConfigs: ValidAnalyseConfig[]) => {
  const preparedApps: PreparedApp[] = [];

  analyseConfigs.forEach(({ config }) => {
    const appsFromConfig = extractAppsFromConfig(config).concat(extractBookmarkAppsFromConfig(config));
    addAppsToPreparedApps(preparedApps, appsFromConfig);
  });

  return preparedApps;
};

const extractAppsFromConfig = (config: OldmarrConfig) => {
  return config.apps.map(mapOldmarrApp);
};

const extractBookmarkAppsFromConfig = (config: OldmarrConfig) => {
  const bookmarkWidgets = config.widgets.filter((widget) => widget.type === "bookmark");
  return bookmarkWidgets.flatMap((widget) =>
    (widget.properties as OldmarrBookmarkDefinition["options"]).items.map(mapOldmarrBookmarkApp),
  );
};

const addAppsToPreparedApps = (preparedApps: PreparedApp[], configApps: InferSelectModel<typeof apps>[]) => {
  configApps.forEach(({ id, ...app }) => {
    const existingApp = preparedApps.find((preparedApp) => doAppsMatch(preparedApp, app));

    if (existingApp) {
      existingApp.ids.push(id);
      return;
    }

    preparedApps.push({
      ...app,
      ids: [id],
    });
  });
};

export const doAppsMatch = (
  app1: Omit<InferSelectModel<typeof apps>, "id">,
  app2: Omit<InferSelectModel<typeof apps>, "id">,
) => {
  return (
    app1.name === app2.name &&
    app1.iconUrl === app2.iconUrl &&
    app1.description === app2.description &&
    app1.href === app2.href
  );
};
