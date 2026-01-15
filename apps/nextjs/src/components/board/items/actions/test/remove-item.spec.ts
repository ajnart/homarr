import { describe, expect, test } from "vitest";

import { removeItemCallback } from "../remove-item";
import { BoardMockBuilder } from "./mocks/board-mock";

describe("removeItemCallback should remove item from board", () => {
  test("should remove correct item from board", () => {
    // Arrange
    const itemIdToRemove = "2";
    const board = new BoardMockBuilder()
      .addItem({ id: "1" })
      .addItem({ id: itemIdToRemove })
      .addItem({ id: "3" })
      .build();

    // Act
    const updatedBoard = removeItemCallback({ itemId: itemIdToRemove })(board);

    // Assert
    const itemIds = updatedBoard.items.map((item) => item.id);
    expect(itemIds).toHaveLength(2);
    expect(itemIds).not.toContain(itemIdToRemove);
  });
  test("should not remove item if item not found", () => {
    // Arrange
    const itemIdToRemove = "2";
    const board = new BoardMockBuilder().addItem({ id: "1" }).addItem({ id: "3" }).build();

    // Act
    const updatedBoard = removeItemCallback({ itemId: itemIdToRemove })(board);

    // Assert
    const itemIds = updatedBoard.items.map((item) => item.id);
    expect(itemIds).toHaveLength(2);
    expect(itemIds).not.toContain(itemIdToRemove);
  });
});
