import type { ResourceParser } from "./resource-parser";

export class CpuResourceParser implements ResourceParser {
  private readonly billionthsCore = 1_000_000_000;
  private readonly millionthsCore = 1_000_000;
  private readonly MiliCore = 1_000;
  private readonly ThousandCore = 1_000;

  parse(value: string): number {
    if (!value.length) {
      return NaN;
    }

    value = value.replace(/,/g, "").trim();

    const [, numericValue, unit = ""] = /^([0-9.]+)\s*([a-zA-Z]*)$/.exec(value) ?? [];

    if (numericValue === undefined) {
      return NaN;
    }

    const parsedValue = parseFloat(numericValue);

    if (isNaN(parsedValue)) {
      return NaN;
    }

    switch (unit.toLowerCase()) {
      case "n": // nano-cores (billionths of a core)
        return parsedValue / this.billionthsCore; // 1 NanoCPU = 1/1,000,000,000 cores
      case "u": // micro-cores (millionths of a core)
        return parsedValue / this.millionthsCore; // 1 MicroCPU = 1/1,000,000 cores
      case "m": // milli-cores
        return parsedValue / this.MiliCore; // 1 milli-core = 1/1000 cores
      case "k": // thousands of cores
        return parsedValue * this.ThousandCore; // 1 thousand-core = 1000 cores
      default: // cores (no unit)
        return parsedValue;
    }
  }
}
