import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrMediaRequestListDefinition = CommonOldmarrWidgetDefinition<
  "media-requests-list",
  {
    replaceLinksWithExternalHost: boolean;
    openInNewTab: boolean;
  }
>;
