import SuperJSON from "superjson";

import { createId } from "@homarr/common";
import { createLogger } from "@homarr/core/infrastructure/logs";
import type { InferInsertModel } from "@homarr/db";
import type { itemLayouts, items } from "@homarr/db/schema";
import type { BoardSize, OldmarrApp, OldmarrWidget } from "@homarr/old-schema";
import { boardSizes } from "@homarr/old-schema";

import type { WidgetComponentProps } from "../../../widgets/src/definition";
import { mapKind } from "../widgets/definitions";
import { mapOptions } from "../widgets/options";

const logger = createLogger({ module: "mapItem" });

export const mapApp = (
  app: OldmarrApp,
  appsMap: Map<string, { id: string }>,
  sectionMap: Map<string, { id: string }>,
  layoutMap: Record<BoardSize, string>,
  boardId: string,
): (InferInsertModel<typeof items> & { layouts: InferInsertModel<typeof itemLayouts>[] }) | null => {
  if (app.area.type === "sidebar") throw new Error("Mapping app in sidebar is not supported");

  const sectionId = sectionMap.get(app.area.properties.id)?.id;
  if (!sectionId) {
    logger.warn("Failed to find section for app. Removing app", {
      appId: app.id,
      sectionId: app.area.properties.id,
    });
    return null;
  }

  const itemId = createId();
  return {
    id: itemId,
    boardId,
    kind: "app",
    options: SuperJSON.stringify({
      // it's safe to assume that the app exists in the map
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      appId: appsMap.get(app.id)?.id!,
      openInNewTab: app.behaviour.isOpeningNewTab,
      pingEnabled: app.network.enabledStatusChecker,
      showTitle: app.appearance.appNameStatus === "normal",
      layout: app.appearance.positionAppName,
      descriptionDisplayMode: app.behaviour.tooltipDescription !== "" ? "tooltip" : "hidden",
    } satisfies WidgetComponentProps<"app">["options"]),
    layouts: boardSizes.map((size) => {
      const shapeForSize = app.shape[size];
      if (!shapeForSize) {
        throw new Error(`Failed to find a shape for appId='${app.id}' screenSize='${size}'`);
      }

      return {
        itemId,
        height: shapeForSize.size.height,
        width: shapeForSize.size.width,
        xOffset: shapeForSize.location.x,
        yOffset: shapeForSize.location.y,
        sectionId,
        layoutId: layoutMap[size],
      };
    }),
  };
};

export const mapWidget = (
  widget: OldmarrWidget,
  appsMap: Map<string, { id: string }>,
  sectionMap: Map<string, { id: string }>,
  layoutMap: Record<BoardSize, string>,
  boardId: string,
): (InferInsertModel<typeof items> & { layouts: InferInsertModel<typeof itemLayouts>[] }) | null => {
  if (widget.area.type === "sidebar") throw new Error("Mapping widget in sidebar is not supported");

  const kind = mapKind(widget.type);
  if (!kind) {
    logger.warn("Failed to map widget type. It's no longer supported", {
      widgetId: widget.id,
      widgetType: widget.type,
    });
    return null;
  }

  const sectionId = sectionMap.get(widget.area.properties.id)?.id;
  if (!sectionId) {
    logger.warn("Failed to find section for widget. Removing widget", {
      widgetId: widget.id,
      sectionId: widget.area.properties.id,
    });
    return null;
  }

  const itemId = createId();
  return {
    id: itemId,
    boardId,
    kind,
    options: SuperJSON.stringify(
      mapOptions(
        widget.type,
        widget.properties,
        new Map([...appsMap.entries()].map(([key, value]) => [key, value.id])),
      ),
    ),
    layouts: boardSizes.map((size) => {
      const shapeForSize = widget.shape[size];
      if (!shapeForSize) {
        throw new Error(`Failed to find a shape for widgetId='${widget.id}' screenSize='${size}'`);
      }

      return {
        itemId,
        height: shapeForSize.size.height,
        width: shapeForSize.size.width,
        xOffset: shapeForSize.location.x,
        yOffset: shapeForSize.location.y,
        sectionId,
        layoutId: layoutMap[size],
      };
    }),
  };
};
