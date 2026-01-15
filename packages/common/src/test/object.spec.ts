import { describe, expect, it } from "vitest";

import { objectEntries, objectKeys } from "../object";

const testObjects = [{ a: 1, c: 3, b: 2 }, { a: 1, b: 2 }, { a: 1 }, {}] as const;

describe("objectKeys should return all keys of an object", () => {
  testObjects.forEach((obj) => {
    it(`should return all keys of the object ${JSON.stringify(obj)}`, () => {
      expect(objectKeys(obj)).toEqual(Object.keys(obj));
    });
  });
});

describe("objectEntries should return all entries of an object", () => {
  testObjects.forEach((obj) => {
    it(`should return all entries of the object ${JSON.stringify(obj)}`, () => {
      expect(objectEntries(obj)).toEqual(Object.entries(obj));
    });
  });
});
