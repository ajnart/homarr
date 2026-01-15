import { describe, expect, test, vi } from "vitest";

import { duplicateItemCallback } from "../duplicate-item";
import * as emptyPositionModule from "../empty-position";
import { BoardMockBuilder } from "./mocks/board-mock";
import { ItemMockBuilder } from "./mocks/item-mock";
import { LayoutMockBuilder } from "./mocks/layout-mock";

describe("item actions duplicate-item", () => {
  test("should copy it in the same section", () => {
    // Arrange
    const itemKind = "minecraftServerStatus";
    const emptyPosition = { xOffset: 5, yOffset: 5 };
    const currentSectionId = "2";
    const layoutId = "1";
    const currentItemSize = { height: 2, width: 3 };

    const layout = new LayoutMockBuilder({ id: layoutId, columnCount: 4 }).build();
    const currentItem = new ItemMockBuilder({
      kind: itemKind,
      integrationIds: ["1"],
      options: { address: "localhost" },
      advancedOptions: { title: "The best one", customCssClasses: ["test"], borderColor: "#ff0000" },
    })
      .addLayout({ layoutId, sectionId: currentSectionId, ...currentItemSize })
      .build();
    const otherItem = new ItemMockBuilder({ id: "2" }).addLayout({ layoutId }).build();

    const board = new BoardMockBuilder()
      .addLayout(layout)
      .addItem(currentItem)
      .addItem(otherItem)
      .addEmptySection({ id: "1", yOffset: 2 })
      .addEmptySection({ id: currentSectionId, yOffset: 0 })
      .addEmptySection({ id: "3", yOffset: 1 })
      .build();

    const spy = vi.spyOn(emptyPositionModule, "getFirstEmptyPosition");
    spy.mockReturnValue(emptyPosition);

    // Act
    const result = duplicateItemCallback({ itemId: currentItem.id })(board);

    // Assert
    expect(result.items.length).toBe(3);
    const duplicatedItem = result.items.find((item) => item.id !== currentItem.id && item.id !== otherItem.id);

    expect(duplicatedItem).toEqual(
      expect.objectContaining({
        kind: itemKind,
        integrationIds: currentItem.integrationIds,
        options: currentItem.options,
        advancedOptions: currentItem.advancedOptions,
        layouts: [
          expect.objectContaining({
            ...emptyPosition,
            ...currentItemSize,
            sectionId: currentSectionId,
          }),
        ],
      }),
    );
  });
});
