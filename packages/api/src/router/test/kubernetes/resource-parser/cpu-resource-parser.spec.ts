import { describe, expect, it } from "vitest";

import { CpuResourceParser } from "../../../kubernetes/resource-parser/cpu-resource-parser";

describe("CpuResourceParser", () => {
  const parser = new CpuResourceParser();

  it("should return NaN for empty or invalid input", () => {
    expect(parser.parse("")).toBeNaN();
    expect(parser.parse(" ")).toBeNaN();
    expect(parser.parse("abc")).toBeNaN();
  });

  it("should parse CPU values without a unit (cores)", () => {
    expect(parser.parse("1")).toBe(1);
    expect(parser.parse("2.5")).toBe(2.5);
    expect(parser.parse("10")).toBe(10);
  });

  it("should parse CPU values with milli-core unit ('m')", () => {
    expect(parser.parse("500m")).toBe(0.5); // 500 milli-cores = 0.5 cores
    expect(parser.parse("250m")).toBe(0.25);
    expect(parser.parse("1000m")).toBe(1);
  });

  it("should parse CPU values with kilo-core unit ('k')", () => {
    expect(parser.parse("1k")).toBe(1000); // 1 kilo-core = 1000 cores
    expect(parser.parse("2k")).toBe(2000);
    expect(parser.parse("0.5k")).toBe(500);
  });

  it("should parse CPU values with nano-core unit ('n')", () => {
    // Adjust the expected values for nano-cores to account for floating-point precision
    expect(parser.parse("1000000000n")).toBe(1); // 1 NanoCPU = 1/1,000,000,000 cores
    expect(parser.parse("500000000n")).toBe(0.5);
    expect(parser.parse("0.000000001n")).toBe(0.000000000000000001); // Tiny value
  });

  it("should parse CPU values with micro-core unit ('u')", () => {
    // Adjust the expected values for micro-cores to account for floating-point precision
    expect(parser.parse("1000000u")).toBe(1); // 1 MicroCPU = 1/1,000,000 cores
    expect(parser.parse("500000u")).toBe(0.5);
    expect(parser.parse("0.000001u")).toBe(0.000000000001); // Tiny value
  });

  it("should handle input with commas", () => {
    expect(parser.parse("1,000")).toBe(1000); // 1,000 cores
    expect(parser.parse("1,500m")).toBe(1.5); // 1,500 milli-cores = 1.5 cores
  });

  it("should ignore leading and trailing whitespace", () => {
    expect(parser.parse(" 1 ")).toBe(1);
    expect(parser.parse(" 500m ")).toBe(0.5);
    expect(parser.parse("  2k ")).toBe(2000);
  });
});
