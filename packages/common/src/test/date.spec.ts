import { describe, expect, it } from "vitest";

import { isDateWithin } from "../date";

describe("isDateWithin", () => {
  it("should return true for a date within the specified hours", () => {
    const date = new Date();
    date.setHours(date.getHours() - 20);
    expect(isDateWithin(date, "100h")).toBe(true);
  });

  it("should return false for a date outside the specified hours", () => {
    const date = new Date();
    date.setHours(date.getHours() - 101);
    expect(isDateWithin(date, "100h")).toBe(false);
  });

  it("should return true for a date within the specified days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    expect(isDateWithin(date, "10d")).toBe(true);
  });

  it("should return false for a date outside the specified days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 11);
    expect(isDateWithin(date, "10d")).toBe(false);
  });

  it("should return true for a date within the specified weeks", () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    expect(isDateWithin(date, "7w")).toBe(true);
  });

  it("should return false for a date outside the specified weeks", () => {
    const date = new Date();
    date.setDate(date.getDate() - 50);
    expect(isDateWithin(date, "7w")).toBe(false);
  });

  it("should return true for a date within the specified months", () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    expect(isDateWithin(date, "2M")).toBe(true);
  });

  it("should return false for a date outside the specified months", () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    expect(isDateWithin(date, "2M")).toBe(false);
  });

  it("should return true for a date within the specified years", () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    expect(isDateWithin(date, "2y")).toBe(true);
  });

  it("should return false for a date outside the specified years", () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 3);
    expect(isDateWithin(date, "2y")).toBe(false);
  });

  it("should return false for a date after the specified relative time", () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    expect(isDateWithin(date, "1d")).toBe(false);
  });

  it("should throw an error for an invalid unit", () => {
    const date = new Date();
    expect(() => isDateWithin(date, "2x")).toThrow("Invalid relative time unit");
  });

  it("should throw an error if relativeDate is less than 2 characters long", () => {
    const date = new Date();
    expect(() => isDateWithin(date, "h")).toThrow("Relative date must be at least 2 characters long");
  });

  it("should throw an error if relativeDate has an invalid number", () => {
    const date = new Date();
    expect(() => isDateWithin(date, "hh")).toThrow("Relative date must be a number greater than 0");
  });

  it("should throw an error if relativeDate is set to 0", () => {
    const date = new Date();
    expect(() => isDateWithin(date, "0y")).toThrow("Relative date must be a number greater than 0");
  });
});
