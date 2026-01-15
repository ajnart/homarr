import { getCurrentLayout } from "@homarr/boards/context";

import type { Board } from "~/app/[locale]/boards/_types";

export interface MoveItemToSectionInput {
  itemId: string;
  sectionId: string;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
}

export const moveItemToSectionCallback =
  ({ itemId, ...layoutInput }: MoveItemToSectionInput) =>
  (board: Board): Board => {
    const currentLayout = getCurrentLayout(board);

    return {
      ...board,
      items: board.items.map((item) =>
        item.id !== itemId
          ? item
          : {
              ...item,
              layouts: item.layouts.map((layout) =>
                layout.layoutId !== currentLayout
                  ? layout
                  : {
                      ...layout,
                      ...layoutInput,
                    },
              ),
            },
      ),
    };
  };
