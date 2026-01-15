import { describe, expect, test } from "vitest";

import type { Section } from "~/app/[locale]/boards/_types";
import { moveCategoryCallback } from "../move-category";

describe("Move Category", () => {
  test.each([
    [3, [0, 3, 4, 1, 2, 5, 6]],
    [5, [0, 1, 2, 5, 6, 3, 4]],
  ])("should move category up", (moveId, expectedOrder) => {
    const sections = createSections(3);

    const input = {
      id: moveId.toString(),
      direction: "up" as const,
    };

    const result = moveCategoryCallback(input)({ sections } as never);

    expect(sortSections(result.sections).map((section) => parseInt(section.id, 10))).toEqual(expectedOrder);
  });
  test.each([
    [1, [0, 3, 4, 1, 2, 5, 6]],
    [3, [0, 1, 2, 5, 6, 3, 4]],
  ])("should move category down", (moveId, expectedOrder) => {
    const sections = createSections(3);

    const input = {
      id: moveId.toString(),
      direction: "down" as const,
    };

    const result = moveCategoryCallback(input)({ sections } as never);

    expect(sortSections(result.sections).map((section) => parseInt(section.id, 10))).toEqual(expectedOrder);
  });
  test("should not move category up if it is at the top", () => {
    const sections = createSections(3);

    const input = {
      id: "1",
      direction: "up" as const,
    };

    const result = moveCategoryCallback(input)({ sections } as never);

    expect(sortSections(result.sections).map((section) => parseInt(section.id, 10))).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  test("should not move category down if it is at the bottom", () => {
    const sections = createSections(3);

    const input = {
      id: "5",
      direction: "down" as const,
    };

    const result = moveCategoryCallback(input)({ sections } as never);

    expect(sortSections(result.sections).map((section) => parseInt(section.id, 10))).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

const createSections = (categoryCount: number) => {
  return Array.from({ length: categoryCount * 2 + 1 }, (_, index) => ({
    id: index.toString(),
    kind: index % 2 === 1 ? ("category" as const) : ("empty" as const),
    name: `Category ${index}`,
    yOffset: index,
    xOffset: 0,
    collapsed: false,
    items: [],
  })) satisfies Section[];
};

const sortSections = (sections: Section[]) => {
  return sections
    .filter((section) => section.kind !== "dynamic")
    .sort((sectionA, sectionB) => sectionA.yOffset - sectionB.yOffset);
};
