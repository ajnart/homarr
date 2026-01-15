import dayjs from "dayjs";
import type { UnitTypeShort } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const validUnits = ["h", "d", "w", "M", "y"] as UnitTypeShort[];

export const isDateWithin = (date: Date, relativeDate: string): boolean => {
  if (relativeDate.length < 2) {
    throw new Error("Relative date must be at least 2 characters long");
  }

  const amount = parseInt(relativeDate.slice(0, -1), 10);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Relative date must be a number greater than 0");
  }

  const unit = relativeDate.slice(-1) as dayjs.UnitTypeShort;
  if (!validUnits.includes(unit)) {
    throw new Error("Invalid relative time unit");
  }

  const startDate = dayjs().subtract(amount, unit);
  return dayjs(date).isBetween(startDate, dayjs(), null, "[]");
};
