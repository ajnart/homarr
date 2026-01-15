import { describe, expect, test } from "vitest";

import type { Item } from "~/app/[locale]/boards/_types";
import { getFirstEmptyPosition } from "../empty-position";

describe("get first empty position", () => {
  test.each([
    [[[" ", " ", " ", " "]], [1, 1], 0, 0],
    [[["a", " ", " ", " "]], [1, 1], 1, 0],
    [[[" ", "a", " ", " "]], [1, 1], 0, 0],
    [
      [
        ["a", "a", " ", " "],
        ["a", "a", " ", " "],
      ],
      [1, 1],
      2,
      0,
    ],
    [[["a", "a", "a", "a"]], [1, 1], 0, 1],
    [
      [
        ["a", "a", "a", "a"],
        ["a", "a", "a", "a"],
      ],
      [1, 1],
      0,
      2,
    ],
    [
      [
        ["a", "a", " ", "b", "b"],
        ["a", "a", " ", "b", "b"],
      ],
      [1, 2],
      2,
      0,
    ],
    [
      [
        ["a", "a", " ", " ", "b", "b"],
        ["a", "a", " ", " ", "b", "b"],
      ],
      [2, 2],
      2,
      0,
    ],
    [
      [
        ["a", "a", " ", "d", "b", "b"],
        ["a", "a", "c", "e", "b", "b"],
      ],
      [1, 1],
      2,
      0,
    ],
    [
      [
        ["a", "a", " ", " ", "b", "b"],
        ["a", "a", " ", "e", "b", "b"],
      ],
      [2, 2],
      0,
      2,
    ],
  ])("should return the first empty position", (layout, size, expectedX, expectedY) => {
    const elements = createElementsFromLayout(layout);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getFirstEmptyPosition(elements, layout[0]!.length, undefined, { width: size[0]!, height: size[1]! });

    expect(result).toEqual({ xOffset: expectedX, yOffset: expectedY });
  });

  test.each([
    [[[" ", " "]], [1, 1], 0, 0, 1],
    [[["a", " "]], [1, 1], 1, 0, 1],
    [[["a", "a"]], [1, 1], undefined, undefined, 1],
    [[["a", "a"]], [1, 1], 0, 1, 2],
    [
      [
        ["a", "b", " ", " "],
        ["a", "c", " ", "d"],
      ],
      [2, 2],
      undefined,
      undefined,
      3,
    ],
    [
      [
        ["a", "b", " ", " "],
        ["a", "c", " ", "d"],
      ],
      [2, 2],
      0,
      2,
      4,
    ],
    [[["a", "b"]], [2, 1], 0, 1, 2],
  ])("should return the first empty position with limited rows", (layout, size, expectedX, expectedY, rowCount) => {
    const elements = createElementsFromLayout(layout);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getFirstEmptyPosition(elements, layout[0]!.length, rowCount, { width: size[0]!, height: size[1]! });

    expect(result).toEqual(expectedX !== undefined ? { xOffset: expectedX, yOffset: expectedY } : undefined);
  });
});

const createElementsFromLayout = (layout: string[][]) => {
  const elements: (Pick<Item["layouts"][number], "xOffset" | "yOffset" | "width" | "height"> & { char: string })[] = [];
  for (let yOffset = 0; yOffset < layout.length; yOffset++) {
    const row = layout[yOffset];
    if (!row) continue;
    for (let xOffset = 0; xOffset < row.length; xOffset++) {
      const item = row[xOffset];
      if (item === " " || !item) continue;

      const existing = elements.find((element) => element.char === item);
      if (existing) {
        existing.height = yOffset - existing.yOffset + 1;
        existing.width = xOffset - existing.xOffset + 1;
        continue;
      }

      elements.push({
        yOffset,
        xOffset,
        width: 1,
        height: 1,
        char: item,
      });
    }
  }

  return elements;
};
