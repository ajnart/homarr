import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrBookmarkDefinition = CommonOldmarrWidgetDefinition<
  "bookmark",
  {
    name: string;
    items: {
      id: string;
      name: string;
      href: string;
      iconUrl: string;
      openNewTab: boolean;
      hideHostname: boolean;
      hideIcon: boolean;
    }[];
    layout: "autoGrid" | "horizontal" | "vertical";
  }
>;

export type BookmarkApp = OldmarrBookmarkDefinition["options"]["items"][number];
