import { describe, expect, it } from "vitest";

import { capitalize } from "../string";

const capitalizeTestCases = [
  ["hello", "Hello"],
  ["World", "World"],
  ["123", "123"],
  ["a", "A"],
  ["two words", "Two words"],
] as const;

describe("capitalize should capitalize the first letter of a string", () => {
  capitalizeTestCases.forEach(([input, expected]) => {
    it(`should capitalize ${input} to ${expected}`, () => {
      expect(capitalize(input)).toEqual(expected);
    });
  });
});
