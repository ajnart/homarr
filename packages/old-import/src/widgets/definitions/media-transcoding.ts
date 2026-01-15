import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrMediaTranscodingDefinition = CommonOldmarrWidgetDefinition<
  "media-transcoding",
  {
    defaultView: "workers" | "queue" | "statistics";
    showHealthCheck: boolean;
    showHealthChecksInQueue: boolean;
    queuePageSize: number;
    showAppIcon: boolean;
  }
>;
