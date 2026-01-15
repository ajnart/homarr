import { createLogger } from "@homarr/core/infrastructure/logs";
import type { BoardSize, OldmarrApp, OldmarrConfig, OldmarrWidget, SizedShape } from "@homarr/old-schema";
import { boardSizes } from "@homarr/old-schema";

import type { GridAlgorithmItem } from "../../../api/src/router/board/grid-algorithm";
import { generateResponsiveGridFor } from "../../../api/src/router/board/grid-algorithm";
import { mapColumnCount } from "../mappers/map-column-count";
import { mapApp, mapWidget } from "../mappers/map-item";

const logger = createLogger({ module: "prepareItems" });

export const prepareItems = (
  { apps, widgets, settings }: Pick<OldmarrConfig, "apps" | "widgets" | "settings">,
  appsMap: Map<string, { id: string }>,
  sectionMap: Map<string, { id: string }>,
  layoutMap: Record<BoardSize, string>,
  boardId: string,
) => {
  let localApps = apps;
  let localWidgets = widgets;

  const incompleteSizes = boardSizes.filter((size) =>
    widgets
      .map((widget) => widget.shape)
      .concat(apps.map((app) => app.shape))
      .some((shape) => !shape[size]),
  );

  if (incompleteSizes.length > 0) {
    logger.warn("Found items with incomplete sizes. Generating missing sizes.", {
      boardId,
      count: incompleteSizes.length,
      sizes: incompleteSizes.join(", "),
    });

    incompleteSizes.forEach((size) => {
      const columnCount = mapColumnCount(settings.customization.gridstack, size);
      const previousSize = !incompleteSizes.includes("lg") ? "lg" : incompleteSizes.includes("sm") ? "md" : "sm";
      const previousWidth = mapColumnCount(settings.customization.gridstack, previousSize);
      logger.info("Generating missing size", { boardId, from: previousSize, to: size });

      const items = widgets
        .map((item) => mapItemForGridAlgorithm(item, previousSize))
        .concat(apps.map((item) => mapItemForGridAlgorithm(item, previousSize)));

      const distinctSectionIds = [...new Set(items.map((item) => item.sectionId))];
      distinctSectionIds.forEach((sectionId) => {
        const { items: newItems } = generateResponsiveGridFor({ items, previousWidth, width: columnCount, sectionId });

        localApps = localApps.map((app) => {
          const item = newItems.find((item) => item.id === app.id);
          if (!item) return app;

          return {
            ...app,
            shape: {
              ...app.shape,
              [size]: mapShapeFromGridAlgorithm(item),
            },
          };
        });

        localWidgets = localWidgets.map((widget) => {
          const item = newItems.find((item) => item.id === widget.id);
          if (!item) return widget;

          return {
            ...widget,
            shape: {
              ...widget.shape,
              [size]: mapShapeFromGridAlgorithm(item),
            },
          };
        });
      });
    });
  }

  return localWidgets
    .map((widget) => mapWidget(widget, appsMap, sectionMap, layoutMap, boardId))
    .concat(localApps.map((app) => mapApp(app, appsMap, sectionMap, layoutMap, boardId)))
    .filter((widget) => widget !== null);
};

const mapItemForGridAlgorithm = (item: OldmarrApp | OldmarrWidget, size: BoardSize): GridAlgorithmItem => ({
  width: item.shape[size]?.size.width ?? 1,
  height: item.shape[size]?.size.height ?? 1,
  xOffset: item.shape[size]?.location.x ?? 0,
  yOffset: item.shape[size]?.location.y ?? 0,
  sectionId: item.area.type === "sidebar" ? item.area.properties.location : item.area.properties.id,
  id: item.id,
  type: "item",
});

const mapShapeFromGridAlgorithm = (item: GridAlgorithmItem) =>
  ({
    location: {
      x: item.xOffset,
      y: item.yOffset,
    },
    size: {
      width: item.width,
      height: item.height,
    },
  }) satisfies SizedShape;
