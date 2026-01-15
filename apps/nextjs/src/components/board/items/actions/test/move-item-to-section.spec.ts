import { describe, expect, test, vi } from "vitest";

import * as boardContext from "@homarr/boards/context";

import { moveItemToSectionCallback } from "../move-item-to-section";
import { BoardMockBuilder } from "./mocks/board-mock";
import { ItemMockBuilder } from "./mocks/item-mock";

describe("moveItemToSectionCallback should move item to section", () => {
  test("should move item to section", () => {
    // Arrange
    const itemToMove = "2";
    const layoutId = "1";
    const spy = vi.spyOn(boardContext, "getCurrentLayout");
    spy.mockReturnValue(layoutId);
    const newPosition = {
      sectionId: "3",
      xOffset: 20,
      yOffset: 30,
      width: 15,
      height: 17,
    };
    const itemA = new ItemMockBuilder().addLayout({ layoutId }).build();
    const itemB = new ItemMockBuilder({ id: itemToMove }).addLayout({ layoutId }).addLayout().build();
    const itemC = new ItemMockBuilder().addLayout({ layoutId }).build();
    const board = new BoardMockBuilder().addItem(itemA).addItem(itemB).addItem(itemC).build();

    // Act
    const updatedBoard = moveItemToSectionCallback({ itemId: itemToMove, ...newPosition })(board);

    // Assert
    expect(updatedBoard.items).toHaveLength(3);
    const movedItem = updatedBoard.items.find((item) => item.id === itemToMove);
    expect(movedItem).not.toBeUndefined();
    expect(movedItem?.layouts.find((layout) => layout.layoutId === layoutId)).toEqual(
      expect.objectContaining(newPosition),
    );
    const otherItemLayouts = updatedBoard.items
      .filter((item) => item.id !== itemToMove)
      .flatMap((item) => item.layouts);
    expect(otherItemLayouts).not.toContainEqual(expect.objectContaining(newPosition));
  });
  test("should not move item if item not found", () => {
    // Arrange
    const itemToMove = "2";
    const layoutId = "1";
    const spy = vi.spyOn(boardContext, "getCurrentLayout");
    spy.mockReturnValue(layoutId);
    const newPosition = {
      sectionId: "3",
      xOffset: 20,
      yOffset: 30,
      width: 15,
      height: 17,
    };
    const itemA = new ItemMockBuilder().addLayout({ layoutId }).build();
    const itemC = new ItemMockBuilder().addLayout({ layoutId }).build();
    const board = new BoardMockBuilder().addItem(itemA).addItem(itemC).build();

    // Act
    const updatedBoard = moveItemToSectionCallback({ itemId: itemToMove, ...newPosition })(board);

    // Assert
    expect(updatedBoard.items).toHaveLength(2);
    expect(updatedBoard.items.find((item) => item.layouts.at(0)?.sectionId === newPosition.sectionId)).toBeUndefined();
  });
});
