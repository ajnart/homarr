import { describe, expect, it } from "vitest";

import { splitToChunksWithNItems, splitToNChunks } from "../array";

describe("splitToNChunks", () => {
  it("should split an array into the specified number of chunks", () => {
    const array = [1, 2, 3, 4, 5];
    const chunks = 3;
    const result = splitToNChunks(array, chunks);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should handle an empty array", () => {
    const array: number[] = [];
    const chunks = 3;
    const result = splitToNChunks(array, chunks);
    expect(result).toEqual([[], [], []]);
  });

  it("should handle more chunks than elements", () => {
    const array = [1, 2];
    const chunks = 5;
    const result = splitToNChunks(array, chunks);
    expect(result).toEqual([[1], [2], [], [], []]);
  });
});

describe("splitToChunksWithNItems", () => {
  it("should split an array into chunks with the specified number of items", () => {
    const array = [1, 2, 3, 4, 5];
    const items = 2;
    const result = splitToChunksWithNItems(array, items);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should handle an empty array", () => {
    const array: number[] = [];
    const items = 2;
    const result = splitToChunksWithNItems(array, items);
    expect(result).toEqual([]);
  });

  it("should handle more items per chunk than elements", () => {
    const array = [1, 2];
    const items = 5;
    const result = splitToChunksWithNItems(array, items);
    expect(result).toEqual([[1, 2]]);
  });
});
