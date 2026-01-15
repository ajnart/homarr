import { expect } from "vitest";

export const expectToBeDefined = <T>(value: T) => {
  if (value === undefined) {
    expect(value).toBeDefined();
  }
  if (value === null) {
    expect(value).not.toBeNull();
  }
  return value as Exclude<T, undefined | null>;
};
