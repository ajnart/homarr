import type { BoardSize, OldmarrConfig } from "@homarr/old-schema";

export const mapColumnCount = (
  gridstackSettings: OldmarrConfig["settings"]["customization"]["gridstack"],
  screenSize: BoardSize,
) => {
  switch (screenSize) {
    case "lg":
      return gridstackSettings.columnCountLarge;
    case "md":
      return gridstackSettings.columnCountMedium;
    case "sm":
      return gridstackSettings.columnCountSmall;
    default:
      return 10;
  }
};
