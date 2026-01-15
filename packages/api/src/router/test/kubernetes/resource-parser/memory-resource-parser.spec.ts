import { describe, expect, it } from "vitest";

import { MemoryResourceParser } from "../../../kubernetes/resource-parser/memory-resource-parser";

const BYTES_IN_GIB = 1024 ** 3; // 1 GiB in bytes
const BYTES_IN_MIB = 1024 ** 2; // 1 MiB in bytes
const BYTES_IN_KIB = 1024; // 1 KiB in bytes
const KI = "Ki";
const MI = "Mi";
const GI = "Gi";
const TI = "Ti";
const PI = "Pi";

describe("MemoryResourceParser", () => {
  const parser = new MemoryResourceParser();

  it("should parse values without units as bytes and convert to GiB", () => {
    expect(parser.parse("1073741824")).toBe(1); // 1 GiB
    expect(parser.parse("2147483648")).toBe(2); // 2 GiB
  });

  it("should parse binary units (Ki, Mi, Gi, Ti, Pi) into GiB", () => {
    expect(parser.parse(`1024${KI}`)).toBeCloseTo(1 / 1024); // 1 MiB = 1/1024 GiB
    expect(parser.parse(`1${MI}`)).toBeCloseTo(1 / 1024); // 1 MiB = 1/1024 GiB
    expect(parser.parse(`1${GI}`)).toBe(1); // 1 GiB
    expect(parser.parse(`1${TI}`)).toBe(BYTES_IN_KIB); // 1 TiB = 1024 GiB
    expect(parser.parse(`1${PI}`)).toBe(BYTES_IN_MIB); // 1 PiB = 1024^2 GiB
  });

  it("should parse decimal units (K, M, G, T, P) into GiB", () => {
    expect(parser.parse("1000K")).toBeCloseTo(1000 / BYTES_IN_GIB); // 1000 KB
    expect(parser.parse("1M")).toBeCloseTo(1 / BYTES_IN_KIB); // 1 MB = 1/1024 GiB
    expect(parser.parse("1G")).toBeCloseTo(0.9313225746154785); // 1 GB ≈ 0.931 GiB
    expect(parser.parse("1T")).toBeCloseTo(931.3225746154785); // 1 TB ≈ 931.32 GiB
    expect(parser.parse("1P")).toBeCloseTo(931322.5746154785); // 1 PB ≈ 931,322.57 GiB
  });

  it("should handle invalid input and return NaN", () => {
    expect(parser.parse("")).toBeNaN();
    expect(parser.parse(" ")).toBeNaN();
    expect(parser.parse("abc")).toBeNaN();
  });

  it("should handle commas in input and convert to GiB", () => {
    expect(parser.parse("1,073,741,824")).toBe(1); // 1 GiB
    expect(parser.parse("1,024Ki")).toBeCloseTo(1 / BYTES_IN_KIB); // 1 MiB
  });

  it("should handle lowercase and uppercase units", () => {
    expect(parser.parse("1ki")).toBeCloseTo(1 / BYTES_IN_KIB); // 1 MiB
    expect(parser.parse("1KI")).toBeCloseTo(1 / BYTES_IN_KIB);
    expect(parser.parse("1Mi")).toBeCloseTo(1 / BYTES_IN_KIB);
    expect(parser.parse("1m")).toBeCloseTo(1 / BYTES_IN_KIB);
  });

  it("should assume bytes for unrecognized or no units and convert to GiB", () => {
    expect(parser.parse("1073741824")).toBe(1); // 1 GiB
    expect(parser.parse("42")).toBeCloseTo(42 / BYTES_IN_GIB); // 42 bytes in GiB
    expect(parser.parse("42unknown")).toBeCloseTo(42 / BYTES_IN_GIB); // Invalid unit = bytes
  });
});
