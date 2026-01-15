import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod/v4";

import { expireDateAfter, generateSessionToken } from "../session";

describe("expireDateAfter should calculate date after specified seconds", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["2023-07-01T00:00:00Z", 60, "2023-07-01T00:01:00Z"], // 1 minute
    ["2023-07-01T00:00:00Z", 60 * 60, "2023-07-01T01:00:00Z"], // 1 hour
    ["2023-07-01T00:00:00Z", 60 * 60 * 24, "2023-07-02T00:00:00Z"], // 1 day
    ["2023-07-01T00:00:00Z", 60 * 60 * 24 * 30, "2023-07-31T00:00:00Z"], // 30 days
    ["2023-07-01T00:00:00Z", 60 * 60 * 24 * 365, "2024-06-30T00:00:00Z"], // 1 year
    ["2023-07-01T00:00:00Z", 60 * 60 * 24 * 365 * 10, "2033-06-28T00:00:00Z"], // 10 years
  ])("should calculate date %s and after %i seconds to equal %s", (initialDate, seconds, expectedDate) => {
    vi.setSystemTime(new Date(initialDate));
    const result = expireDateAfter(seconds);
    expect(result).toEqual(new Date(expectedDate));
  });
});

describe("generateSessionToken should return a random UUID", () => {
  it("should return a random UUID", () => {
    const result = generateSessionToken();
    expect(
      z
        .string()
        .regex(/^[a-f0-9]+$/)
        .safeParse(result).success,
    ).toBe(true);
  });
  it("should return a different token each time", () => {
    const result1 = generateSessionToken();
    const result2 = generateSessionToken();
    expect(result1).not.toEqual(result2);
  });
});
