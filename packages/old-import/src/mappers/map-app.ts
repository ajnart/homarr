import type { InferSelectModel } from "@homarr/db";
import type { apps } from "@homarr/db/schema";
import type { OldmarrApp } from "@homarr/old-schema";

import type { OldmarrBookmarkDefinition } from "../widgets/definitions/bookmark";

export const mapOldmarrApp = (app: OldmarrApp): InferSelectModel<typeof apps> => {
  return {
    id: app.id,
    name: app.name,
    iconUrl: app.appearance.iconUrl,
    description: app.behaviour.tooltipDescription ?? null,
    href: app.behaviour.externalUrl || app.url,
    pingUrl: app.url.length > 0 ? app.url : null,
  };
};

export const mapOldmarrBookmarkApp = (
  app: OldmarrBookmarkDefinition["options"]["items"][number],
): InferSelectModel<typeof apps> => {
  return {
    id: app.id,
    name: app.name,
    iconUrl: app.iconUrl,
    description: null,
    href: app.href,
    pingUrl: null,
  };
};
