import { createId } from "@homarr/common";
import type { InferInsertModel } from "@homarr/db";
import type { boards } from "@homarr/db/schema";

import type { prepareMultipleImports } from "../prepare/prepare-multiple";
import { mapColor } from "./map-colors";

type PreparedBoard = ReturnType<typeof prepareMultipleImports>["preparedBoards"][number];

export const mapBoard = (preparedBoard: PreparedBoard): InferInsertModel<typeof boards> => ({
  id: createId(),
  name: preparedBoard.name,
  backgroundImageAttachment: preparedBoard.config.settings.customization.backgroundImageAttachment,
  backgroundImageUrl: preparedBoard.config.settings.customization.backgroundImageUrl,
  backgroundImageRepeat: preparedBoard.config.settings.customization.backgroundImageRepeat,
  backgroundImageSize: preparedBoard.config.settings.customization.backgroundImageSize,
  faviconImageUrl: mapFavicon(preparedBoard.config.settings.customization.faviconUrl),
  isPublic: preparedBoard.config.settings.access.allowGuests,
  logoImageUrl: mapLogo(preparedBoard.config.settings.customization.logoImageUrl),
  pageTitle: preparedBoard.config.settings.customization.pageTitle,
  metaTitle: preparedBoard.config.settings.customization.metaTitle,
  opacity: preparedBoard.config.settings.customization.appOpacity,
  primaryColor: mapColor(preparedBoard.config.settings.customization.colors.primary, "#fa5252"),
  secondaryColor: mapColor(preparedBoard.config.settings.customization.colors.secondary, "#fd7e14"),
});

const defaultOldmarrLogoPath = "/imgs/logo/logo.png";

const mapLogo = (logo: string | null | undefined) => {
  if (!logo) {
    return null;
  }

  if (logo.trim() === defaultOldmarrLogoPath) {
    return null; // We fallback to default logo when null
  }

  return logo;
};

const defaultOldmarrFaviconPath = "/imgs/favicon/favicon-squared.png";

const mapFavicon = (favicon: string | null | undefined) => {
  if (!favicon) {
    return null;
  }

  if (favicon.trim() === defaultOldmarrFaviconPath) {
    return null; // We fallback to default favicon when null
  }

  return favicon;
};
