import { describe, expect, test, vi } from "vitest";

import * as boardContext from "@homarr/boards/context";

import { createItemCallback } from "../create-item";
import * as emptyPositionModule from "../empty-position";
import { BoardMockBuilder } from "./mocks/board-mock";
import { DynamicSectionMockBuilder } from "./mocks/dynamic-section-mock";
import { ItemMockBuilder } from "./mocks/item-mock";
import { LayoutMockBuilder } from "./mocks/layout-mock";

describe("item actions create-item", () => {
  test("should add it to first section", () => {
    // Arrange
    const itemKind = "clock";
    const emptyPosition = { xOffset: 5, yOffset: 5 };
    const firstSectionId = "2";
    const layoutId = "1";

    const layout = new LayoutMockBuilder({ id: layoutId, columnCount: 4 }).build();
    const board = new BoardMockBuilder()
      .addLayout(layout)
      .addLayout()
      .addEmptySection({ id: "1", yOffset: 2 })
      .addEmptySection({ id: firstSectionId, yOffset: 0 })
      .addEmptySection({ id: "3", yOffset: 1 })
      .build();

    const emptyPositionSpy = vi.spyOn(emptyPositionModule, "getFirstEmptyPosition");
    emptyPositionSpy.mockReturnValue(emptyPosition);
    const layoutsSpy = vi.spyOn(boardContext, "getBoardLayouts");
    layoutsSpy.mockReturnValue([layoutId]);

    // Act
    const result = createItemCallback({
      kind: itemKind,
    })(board);

    // Assert
    const item = result.items.at(0);
    expect(item).toEqual(
      expect.objectContaining({
        kind: itemKind,
        layouts: [
          {
            layoutId,
            height: 1,
            width: 1,
            ...emptyPosition,
            sectionId: firstSectionId,
          },
        ],
      }),
    );
    expect(emptyPositionSpy).toHaveBeenCalledWith([], layout.columnCount);
  });
  test("should correctly pass dynamic section and items to getFirstEmptyPosition", () => {
    // Arrange
    const itemKind = "clock";
    const emptyPosition = { xOffset: 5, yOffset: 5 };
    const firstSectionId = "2";
    const layoutId = "1";
    const itemAndSectionPosition = { height: 2, width: 3, yOffset: 2, xOffset: 1 };

    const layout = new LayoutMockBuilder({ id: layoutId, columnCount: 4 }).build();
    const dynamicSectionInFirstSection = new DynamicSectionMockBuilder({ id: "4" })
      .addLayout({ ...itemAndSectionPosition, layoutId, parentSectionId: firstSectionId })
      .build();
    const itemInFirstSection = new ItemMockBuilder({ id: "12" })
      .addLayout({ ...itemAndSectionPosition, layoutId, sectionId: firstSectionId })
      .build();
    const otherDynamicSection = new DynamicSectionMockBuilder({ id: "5" }).addLayout({ layoutId }).build();
    const otherItem = new ItemMockBuilder({ id: "13" }).addLayout({ layoutId }).build();
    const board = new BoardMockBuilder()
      .addLayout(layout)
      .addEmptySection({ id: "1", yOffset: 2 })
      .addEmptySection({ id: firstSectionId, yOffset: 0 })
      .addEmptySection({ id: "3", yOffset: 1 })
      .addSection(dynamicSectionInFirstSection)
      .addSection(otherDynamicSection)
      .addItem(itemInFirstSection)
      .addItem(otherItem)
      .build();

    const spy = vi.spyOn(emptyPositionModule, "getFirstEmptyPosition");
    spy.mockReturnValue(emptyPosition);
    const layoutsSpy = vi.spyOn(boardContext, "getBoardLayouts");
    layoutsSpy.mockReturnValue([layoutId]);

    // Act
    const result = createItemCallback({
      kind: itemKind,
    })(board);

    // Assert
    expect(result.items.length).toBe(3);
    const item = result.items.find((item) => item.id !== itemInFirstSection.id && item.id !== otherItem.id);
    expect(item).toEqual(
      expect.objectContaining({
        kind: itemKind,
        layouts: [{ ...emptyPosition, height: 1, width: 1, sectionId: firstSectionId, layoutId }],
      }),
    );
    expect(spy).toHaveBeenCalledWith(
      [expect.objectContaining(itemAndSectionPosition), expect.objectContaining(itemAndSectionPosition)],
      layout.columnCount,
    );
  });
});
