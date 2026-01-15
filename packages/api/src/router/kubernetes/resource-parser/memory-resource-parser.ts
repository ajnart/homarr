import type { ResourceParser } from "./resource-parser";

export class MemoryResourceParser implements ResourceParser {
  private readonly binaryMultipliers: Record<string, number> = {
    ki: 1024,
    mi: 1024 ** 2,
    gi: 1024 ** 3,
    ti: 1024 ** 4,
    pi: 1024 ** 5,
  } as const;

  private readonly decimalMultipliers: Record<string, number> = {
    k: 1000,
    m: 1000 ** 2,
    g: 1000 ** 3,
    t: 1000 ** 4,
    p: 1000 ** 5,
  } as const;

  parse(value: string): number {
    if (!value.length) {
      return NaN;
    }

    value = value.replace(/,/g, "").trim();

    const [, numericValue, unit = ""] = /^([0-9.]+)\s*([a-zA-Z]*)$/.exec(value) ?? [];

    if (!numericValue) {
      return NaN;
    }

    const parsedValue = parseFloat(numericValue);

    if (isNaN(parsedValue)) {
      return NaN;
    }

    const unitLower = unit.toLowerCase();

    // Handle binary units (Ki, Mi, Gi, etc.)
    if (unitLower in this.binaryMultipliers) {
      const multiplier = this.binaryMultipliers[unitLower];
      const giMultiplier = this.binaryMultipliers.gi;

      if (multiplier !== undefined && giMultiplier !== undefined) {
        return (parsedValue * multiplier) / giMultiplier;
      }
    }

    // Handle decimal units (K, M, G, etc.)
    if (unitLower in this.decimalMultipliers) {
      const multiplier = this.decimalMultipliers[unitLower];
      const giMultiplier = this.binaryMultipliers.gi;

      if (multiplier !== undefined && giMultiplier !== undefined) {
        return (parsedValue * multiplier) / giMultiplier;
      }
    }

    // No unit or unrecognized unit, assume bytes and convert to GiB
    const giMultiplier = this.binaryMultipliers.gi;
    if (giMultiplier !== undefined) {
      return parsedValue / giMultiplier;
    }

    return NaN; // Return NaN if giMultiplier is undefined
  }
}
