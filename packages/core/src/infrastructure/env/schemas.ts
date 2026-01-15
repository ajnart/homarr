import { z } from "zod/v4";

const trueStrings = ["1", "yes", "t", "true"];
const falseStrings = ["0", "no", "f", "false"];

export const createBooleanSchema = (defaultValue: boolean) =>
  z
    .stringbool({
      truthy: trueStrings,
      falsy: falseStrings,
      case: "insensitive",
    })
    .default(defaultValue);

export const createDurationSchema = (defaultValue: `${number}${"s" | "m" | "h" | "d"}`) =>
  z
    .string()
    .regex(/^\d+[smhd]?$/)
    .default(defaultValue)
    .transform((duration) => {
      const lastChar = duration[duration.length - 1] as "s" | "m" | "h" | "d";
      if (!isNaN(Number(lastChar))) {
        return Number(defaultValue);
      }

      const multipliers = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 60 * 60 * 24,
      };
      const numberDuration = Number(duration.slice(0, -1));
      const multiplier = multipliers[lastChar];

      return numberDuration * multiplier;
    });
