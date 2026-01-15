import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrVideoStreamDefinition = CommonOldmarrWidgetDefinition<
  "video-stream",
  {
    FeedUrl: string;
    autoPlay: boolean;
    muted: boolean;
    controls: boolean;
  }
>;
