import { objectEntries } from "@homarr/common";
import { createLogger } from "@homarr/core/infrastructure/logs";
import type { BoardSize, OldmarrApp, OldmarrConfig, OldmarrWidget } from "@homarr/old-schema";
import { boardSizes } from "@homarr/old-schema";

import { mapColumnCount } from "./mappers/map-column-count";
import type { OldmarrImportConfiguration } from "./settings";

const logger = createLogger({ module: "moveWidgetsAndAppsMerge" });

export const moveWidgetsAndAppsIfMerge = (
  old: OldmarrConfig,
  wrapperIdsToMerge: string[],
  configuration: OldmarrImportConfiguration,
) => {
  const firstId = wrapperIdsToMerge[0];
  if (!firstId) {
    return { apps: old.apps, widgets: old.widgets };
  }

  const affectedMap = new Map<string, { apps: OldmarrApp[]; widgets: OldmarrWidget[] }>(
    wrapperIdsToMerge.map((id) => [
      id,
      {
        apps: old.apps.filter((app) => app.area.type !== "sidebar" && id === app.area.properties.id),
        widgets: old.widgets.filter((app) => app.area.type !== "sidebar" && id === app.area.properties.id),
      },
    ]),
  );

  logger.debug("Merging wrappers at the end of the board", { count: wrapperIdsToMerge.length });

  const offsets = boardSizes.reduce(
    (previous, screenSize) => {
      previous[screenSize] = 0;
      return previous;
    },
    {} as Record<BoardSize, number>,
  );
  for (const id of wrapperIdsToMerge) {
    const requiredHeights = boardSizes.reduce(
      (previous, screenSize) => {
        previous[screenSize] = 0;
        return previous;
      },
      {} as Record<BoardSize, number>,
    );
    const affected = affectedMap.get(id);
    if (!affected) {
      continue;
    }

    const apps = affected.apps;
    const widgets = affected.widgets;

    for (const app of apps) {
      if (app.area.type === "sidebar") continue;
      // Move item to first wrapper
      app.area.properties.id = firstId;

      for (const screenSize of boardSizes) {
        const screenSizeShape = app.shape[screenSize];
        if (!screenSizeShape) {
          continue;
        }

        // Find the highest widget in the wrapper to increase the offset accordingly
        if (screenSizeShape.location.y + screenSizeShape.size.height > requiredHeights[screenSize]) {
          requiredHeights[screenSize] = screenSizeShape.location.y + screenSizeShape.size.height;
        }

        // Move item down as much as needed to not overlap with other items
        screenSizeShape.location.y += offsets[screenSize];
      }
    }

    for (const widget of widgets) {
      if (widget.area.type === "sidebar") continue;
      // Move item to first wrapper
      widget.area.properties.id = firstId;

      for (const screenSize of boardSizes) {
        const screenSizeShape = widget.shape[screenSize];
        if (!screenSizeShape) {
          continue;
        }

        // Find the highest widget in the wrapper to increase the offset accordingly
        if (screenSizeShape.location.y + screenSizeShape.size.height > requiredHeights[screenSize]) {
          requiredHeights[screenSize] = screenSizeShape.location.y + screenSizeShape.size.height;
        }

        // Move item down as much as needed to not overlap with other items
        screenSizeShape.location.y += offsets[screenSize];
      }
    }

    for (const screenSize of boardSizes) {
      offsets[screenSize] += requiredHeights[screenSize];
    }
  }

  if (configuration.sidebarBehaviour === "last-section") {
    const areas = [...old.apps.map((app) => app.area), ...old.widgets.map((widget) => widget.area)];
    if (
      old.settings.customization.layout.enabledLeftSidebar ||
      areas.some((area) => area.type === "sidebar" && area.properties.location === "left")
    ) {
      for (const screenSize of boardSizes) {
        offsets[screenSize] = moveWidgetsAndAppsInLeftSidebar(old, firstId, offsets[screenSize], screenSize);
      }
    }

    if (
      old.settings.customization.layout.enabledRightSidebar ||
      areas.some((area) => area.type === "sidebar" && area.properties.location === "right")
    ) {
      for (const screenSize of boardSizes) {
        moveWidgetsAndAppsInRightSidebar(old, firstId, offsets[screenSize], screenSize);
      }
    }
  } else {
    // Remove all widgets and apps in the sidebar
    return {
      apps: old.apps.filter((app) => app.area.type !== "sidebar"),
      widgets: old.widgets.filter((app) => app.area.type !== "sidebar"),
    };
  }

  return { apps: old.apps, widgets: old.widgets };
};

const moveWidgetsAndAppsInLeftSidebar = (
  old: OldmarrConfig,
  firstId: string,
  offset: number,
  screenSize: BoardSize,
) => {
  const columnCount = mapColumnCount(old.settings.customization.gridstack, screenSize);
  let requiredHeight = updateItems({
    // This should work as the reference of the items did not change, only the array reference did
    items: [...old.widgets, ...old.apps],
    screenSize,
    filter: (item) =>
      item.area.type === "sidebar" &&
      item.area.properties.location === "left" &&
      (columnCount >= 2 || item.shape[screenSize]?.location.x === 0),
    update: (item) => {
      item.area = {
        type: "wrapper",
        properties: {
          id: firstId,
        },
      };

      const screenSizeShape = item.shape[screenSize];
      if (!screenSizeShape) return;

      // Reduce width to one if column count is one
      if (screenSizeShape.size.width > columnCount) {
        screenSizeShape.size.width = columnCount;
      }

      screenSizeShape.location.y += offset;
    },
  });

  // Only increase offset if there are less than 3 columns because then the items have to be stacked
  if (columnCount <= 3) {
    offset += requiredHeight;
  }

  // When column count is 0 we need to stack the items of the sidebar on top of each other
  if (columnCount !== 1) {
    return offset;
  }

  requiredHeight = updateItems({
    // This should work as the reference of the items did not change, only the array reference did
    items: [...old.widgets, ...old.apps],
    screenSize,
    filter: (item) =>
      item.area.type === "sidebar" &&
      item.area.properties.location === "left" &&
      item.shape[screenSize]?.location.x === 1,
    update: (item) => {
      item.area = {
        type: "wrapper",
        properties: {
          id: firstId,
        },
      };

      const screenSizeShape = item.shape[screenSize];
      if (!screenSizeShape) return;

      screenSizeShape.location.x = 0;
      screenSizeShape.location.y += offset;
    },
  });

  offset += requiredHeight;
  return offset;
};

const moveWidgetsAndAppsInRightSidebar = (
  old: OldmarrConfig,
  firstId: string,
  offset: number,
  screenSize: BoardSize,
) => {
  const columnCount = mapColumnCount(old.settings.customization.gridstack, screenSize);
  const xOffsetDelta = Math.max(columnCount - 2, 0);
  const requiredHeight = updateItems({
    // This should work as the reference of the items did not change, only the array reference did
    items: [...old.widgets, ...old.apps],
    screenSize,
    filter: (item) =>
      item.area.type === "sidebar" &&
      item.area.properties.location === "right" &&
      (columnCount >= 2 || item.shape[screenSize]?.location.x === 0),
    update: (item) => {
      item.area = {
        type: "wrapper",
        properties: {
          id: firstId,
        },
      };

      const screenSizeShape = item.shape[screenSize];
      if (!screenSizeShape) return;

      // Reduce width to one if column count is one
      if (screenSizeShape.size.width > columnCount) {
        screenSizeShape.size.width = columnCount;
      }

      screenSizeShape.location.y += offset;
      screenSizeShape.location.x += xOffsetDelta;
    },
  });

  // When column count is 0 we need to stack the items of the sidebar on top of each other
  if (columnCount !== 1) {
    return;
  }

  offset += requiredHeight;

  updateItems({
    // This should work as the reference of the items did not change, only the array reference did
    items: [...old.widgets, ...old.apps],
    screenSize,
    filter: (item) =>
      item.area.type === "sidebar" &&
      item.area.properties.location === "left" &&
      item.shape[screenSize]?.location.x === 1,
    update: (item) => {
      item.area = {
        type: "wrapper",
        properties: {
          id: firstId,
        },
      };

      const screenSizeShape = item.shape[screenSize];
      if (!screenSizeShape) return;

      screenSizeShape.location.x = 0;
      screenSizeShape.location.y += offset;
    },
  });
};

const createItemSnapshot = (item: OldmarrApp | OldmarrWidget, screenSize: BoardSize) => ({
  x: item.shape[screenSize]?.location.x,
  y: item.shape[screenSize]?.location.y,
  height: item.shape[screenSize]?.size.height,
  width: item.shape[screenSize]?.size.width,
  section:
    item.area.type === "sidebar"
      ? {
          type: "sidebar",
          location: item.area.properties.location,
        }
      : {
          type: item.area.type,
          id: item.area.properties.id,
        },
  toString(): string {
    return objectEntries(this)
      .filter(([key]) => key !== "toString")
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(" ");
  },
});

const updateItems = (options: {
  items: (OldmarrApp | OldmarrWidget)[];
  filter: (item: OldmarrApp | OldmarrWidget) => boolean;
  update: (item: OldmarrApp | OldmarrWidget) => void;
  screenSize: BoardSize;
}) => {
  const items = options.items.filter(options.filter);
  let requiredHeight = 0;
  for (const item of items) {
    const before = createItemSnapshot(item, options.screenSize);

    options.update(item);

    const screenSizeShape = item.shape[options.screenSize];
    if (!screenSizeShape) return requiredHeight;

    if (screenSizeShape.location.y + screenSizeShape.size.height > requiredHeight) {
      requiredHeight = screenSizeShape.location.y + screenSizeShape.size.height;
    }

    const after = createItemSnapshot(item, options.screenSize);

    logger.debug(
      `Moved item ${item.id}\n [snapshot before]: ${before.toString()}\n [snapshot after]: ${after.toString()}`,
    );
  }

  return requiredHeight;
};
