/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, test, vi } from "vitest";

import * as boardContext from "@homarr/boards/context";

import type { DynamicSection, Section } from "~/app/[locale]/boards/_types";
import { BoardMockBuilder } from "~/components/board/items/actions/test/mocks/board-mock";
import { CategorySectionMockBuilder } from "~/components/board/items/actions/test/mocks/category-section-mock";
import { DynamicSectionMockBuilder } from "~/components/board/items/actions/test/mocks/dynamic-section-mock";
import { EmptySectionMockBuilder } from "~/components/board/items/actions/test/mocks/empty-section-mock";
import { ItemMockBuilder } from "~/components/board/items/actions/test/mocks/item-mock";
import { removeCategoryCallback } from "../remove-category";

describe("Remove Category", () => {
  test.each([
    [3, [0, 1, 2, 3, 4, 5, 6], [0, 1, 2, 5, 6], [3, 4], 2],
    [5, [0, 1, 2, 3, 4, 5, 6], [0, 1, 2, 3, 4], [5, 6], 4],
    [1, [0, 1, 2, 3, 4, 5, 6], [0, 3, 4, 5, 6], [1, 2], 0],
    [3, [0, 3, 6, 7, 8], [0, 7, 8], [3, 6], 0],
  ])(
    "should remove category",
    (removeId, initialYOffsets, expectedYOffsets, expectedRemovals, expectedLocationOfItems) => {
      // Arrange
      const layoutId = "1";
      const input = removeId.toString();

      const board = new BoardMockBuilder()
        .addLayout({ id: layoutId })
        .addSections(createSections(initialYOffsets))
        .addItems(createSectionItems(initialYOffsets, layoutId))
        .build();

      vi.spyOn(boardContext, "getBoardLayouts").mockReturnValue([layoutId]);

      // Act
      const result = removeCategoryCallback({ id: input })(board);

      // Assert
      expect(result.sections.map((section) => parseInt(section.id, 10))).toEqual(expectedYOffsets);
      expectedRemovals.forEach((expectedRemoval) => {
        expect(result.sections.find((section) => section.id === expectedRemoval.toString())).toBeUndefined();
      });
      const aboveSectionItems = result.items.filter(
        (item) => item.layouts[0]?.sectionId === expectedLocationOfItems.toString(),
      );
      expect(aboveSectionItems.map((item) => parseInt(item.id, 10))).toEqual(expect.arrayContaining(expectedRemovals));
    },
  );

  test("should correctly move items to above empty section", () => {
    // Arrange
    const layoutId = "1";
    const sectionIds = {
      above: "2",
      category: "3",
      below: "4",
      dynamic: "7",
    };
    const initialYOffsets = [0, 1, 2, 3, 4, 5, 6];

    const board = new BoardMockBuilder()
      .addLayout({ id: layoutId })
      .addSections(createSections(initialYOffsets))
      .addItems(createSectionItems([0, 1, 5, 6], layoutId)) // Only add items to other sections
      .addDynamicSection(
        new DynamicSectionMockBuilder({ id: sectionIds.dynamic })
          .addLayout({ layoutId, parentSectionId: sectionIds.category, yOffset: 7, height: 3 })
          .build(),
      )
      .addItem(new ItemMockBuilder({ id: "above-1" }).addLayout({ layoutId, sectionId: sectionIds.above }).build())
      .addItem(
        new ItemMockBuilder({ id: "above-2" })
          .addLayout({ layoutId, sectionId: sectionIds.above, yOffset: 3, xOffset: 2, height: 2 })
          .build(),
      )
      .addItem(
        new ItemMockBuilder({ id: "category-1" }).addLayout({ layoutId, sectionId: sectionIds.category }).build(),
      )
      .addItem(
        new ItemMockBuilder({ id: "category-2" })
          .addLayout({ layoutId, sectionId: sectionIds.category, yOffset: 2, xOffset: 4, width: 4 })
          .build(),
      )
      .addItem(
        new ItemMockBuilder({ id: "below-1" }).addLayout({ layoutId, sectionId: sectionIds.below, xOffset: 5 }).build(),
      )
      .addItem(
        new ItemMockBuilder({ id: "below-2" })
          .addLayout({ layoutId, sectionId: sectionIds.below, yOffset: 1, xOffset: 1, height: 2 })
          .build(),
      )
      .addItem(new ItemMockBuilder({ id: "dynamic-1" }).addLayout({ layoutId, sectionId: sectionIds.dynamic }).build())
      .build();

    vi.spyOn(boardContext, "getBoardLayouts").mockReturnValue([layoutId]);

    // Act
    const result = removeCategoryCallback({ id: sectionIds.category })(board);

    // Assert
    expect(result.sections.map((section) => parseInt(section.id, 10))).toEqual([0, 1, 2, 5, 6, 7]);
    const aboveSectionItems = result.items.filter((item) => item.layouts[0]?.sectionId === sectionIds.above);
    expect(aboveSectionItems.length).toBe(6);

    expect(
      aboveSectionItems
        .map((item) => ({
          ...item,
          ...item.layouts[0]!,
        }))
        .sort((itemA, itemB) => itemA.yOffset - itemB.yOffset),
    ).toEqual([
      expect.objectContaining({ id: "above-1", yOffset: 0, xOffset: 0 }),
      expect.objectContaining({ id: "above-2", yOffset: 3, xOffset: 2, height: 2 }),
      expect.objectContaining({ id: "category-1", yOffset: 5, xOffset: 0 }),
      expect.objectContaining({ id: "category-2", yOffset: 7, xOffset: 4, width: 4 }),
      expect.objectContaining({ id: "below-1", yOffset: 15, xOffset: 5 }),
      expect.objectContaining({ id: "below-2", yOffset: 16, xOffset: 1, height: 2 }),
    ]);

    const dynamicSection = result.sections.find((section): section is DynamicSection => section.id === "7")!;
    expect(dynamicSection.layouts.at(0)?.yOffset).toBe(12);
    expect(dynamicSection.layouts[0]?.parentSectionId).toBe("2");
  });
});

const createSections = (initialYOffsets: number[]) => {
  return initialYOffsets.map((yOffset, index) =>
    index % 2 === 0
      ? new EmptySectionMockBuilder({
          id: yOffset.toString(),
          yOffset,
        }).build()
      : new CategorySectionMockBuilder({
          id: yOffset.toString(),
          yOffset,
        }).build(),
  ) satisfies Section[];
};

const createSectionItems = (initialYOffsets: number[], layoutId: string) => {
  return initialYOffsets.map((yOffset) =>
    new ItemMockBuilder({ id: yOffset.toString() }).addLayout({ layoutId, sectionId: yOffset.toString() }).build(),
  );
};
