import { createId } from "@homarr/common";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { createDbInsertCollectionForTransaction } from "@homarr/db/collection";
import type { BoardSize, OldmarrConfig } from "@homarr/old-schema";
import { boardSizes, getBoardSizeName } from "@homarr/old-schema";

import { fixSectionIssues } from "../../fix-section-issues";
import { OldHomarrImportError } from "../../import-error";
import { mapBoard } from "../../mappers/map-board";
import { mapBreakpoint } from "../../mappers/map-breakpoint";
import { mapColumnCount } from "../../mappers/map-column-count";
import { moveWidgetsAndAppsIfMerge } from "../../move-widgets-and-apps-merge";
import { prepareItems } from "../../prepare/prepare-items";
import type { prepareMultipleImports } from "../../prepare/prepare-multiple";
import { prepareSections } from "../../prepare/prepare-sections";
import type { InitialOldmarrImportSettings } from "../../settings";

const logger = createLogger({ module: "boardCollection" });

export const createBoardInsertCollection = (
  { preparedApps, preparedBoards }: Omit<ReturnType<typeof prepareMultipleImports>, "preparedIntegrations">,
  settings: InitialOldmarrImportSettings,
) => {
  const insertCollection = createDbInsertCollectionForTransaction([
    "apps",
    "boards",
    "layouts",
    "sections",
    "items",
    "itemLayouts",
  ]);
  logger.info("Preparing boards for insert collection");

  const appsMap = new Map(
    preparedApps.flatMap(({ ids, ...app }) => {
      const id = app.existingId ?? createId();
      return ids.map((oldId) => [oldId, { id, ...app }] as const);
    }),
  );

  for (const app of appsMap.values()) {
    // Skip duplicate apps
    if (insertCollection.apps.some((appEntry) => appEntry.id === app.id)) {
      continue;
    }
    // Skip apps that already exist in the database
    if (app.existingId) {
      continue;
    }

    insertCollection.apps.push(app);
  }

  if (settings.onlyImportApps) {
    logger.info("Skipping boards and sections import due to onlyImportApps setting", {
      appCount: insertCollection.apps.length,
    });
    return insertCollection;
  }
  logger.debug("Added apps to board insert collection", { count: insertCollection.apps.length });

  preparedBoards.forEach((board) => {
    if (!hasEnoughItemShapes(board.config)) {
      throw new OldHomarrImportError(
        board.config,
        new Error("Your config contains items without shapes for all board sizes."),
      );
    }

    const { wrappers, categories, wrapperIdsToMerge } = fixSectionIssues(board.config);
    const { apps, widgets } = moveWidgetsAndAppsIfMerge(board.config, wrapperIdsToMerge, {
      ...settings,
      name: board.name,
    });

    logger.debug("Fixed issues with sections and item positions", { fileName: board.name });

    const mappedBoard = mapBoard(board);
    logger.debug("Mapped board", { fileName: board.name, boardId: mappedBoard.id });
    insertCollection.boards.push(mappedBoard);

    const layoutMapping = boardSizes.reduce(
      (acc, size) => {
        acc[size] = createId();
        return acc;
      },
      {} as Record<BoardSize, string>,
    );

    insertCollection.layouts.push(
      ...boardSizes.map((size) => ({
        id: layoutMapping[size],
        boardId: mappedBoard.id,
        columnCount: mapColumnCount(board.config.settings.customization.gridstack, size),
        breakpoint: mapBreakpoint(size),
        name: getBoardSizeName(size),
      })),
    );

    const preparedSections = prepareSections(mappedBoard.id, { wrappers, categories });

    for (const section of preparedSections.values()) {
      insertCollection.sections.push(section);
    }
    logger.debug("Added sections to board insert collection", { count: insertCollection.sections.length });

    const preparedItems = prepareItems(
      {
        apps,
        widgets,
        settings: board.config.settings,
      },
      appsMap,
      preparedSections,
      layoutMapping,
      mappedBoard.id,
    );
    preparedItems.forEach(({ layouts, ...item }) => {
      insertCollection.items.push(item);
      insertCollection.itemLayouts.push(...layouts);
    });
    logger.debug("Added items to board insert collection", { count: insertCollection.items.length });
  });

  logger.info("Board collection prepared", {
    boardCount: insertCollection.boards.length,
    sectionCount: insertCollection.sections.length,
    itemCount: insertCollection.items.length,
    appCount: insertCollection.apps.length,
  });

  return insertCollection;
};

export const hasEnoughItemShapes = (config: {
  apps: Pick<OldmarrConfig["apps"][number], "shape">[];
  widgets: Pick<OldmarrConfig["widgets"][number], "shape">[];
}) => {
  const invalidSizes: BoardSize[] = [];

  for (const size of boardSizes) {
    if (invalidSizes.includes(size)) continue;

    if (config.apps.some((app) => app.shape[size] === undefined)) {
      invalidSizes.push(size);
    }

    if (invalidSizes.includes(size)) continue;

    if (config.widgets.some((widget) => widget.shape[size] === undefined)) {
      invalidSizes.push(size);
    }
  }

  return invalidSizes.length <= 2;
};
