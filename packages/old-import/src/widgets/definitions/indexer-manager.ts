import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrIndexerManagerDefinition = CommonOldmarrWidgetDefinition<
  "indexer-manager",
  {
    openIndexerSiteInNewTab: boolean;
  }
>;
