import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrMediaRequestStatsDefinition = CommonOldmarrWidgetDefinition<
  "media-requests-stats",
  {
    replaceLinksWithExternalHost: boolean;
    openInNewTab: boolean;
  }
>;
