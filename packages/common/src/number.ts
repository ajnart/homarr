const ranges = [
  { divider: 1e18, suffix: "E" },
  { divider: 1e15, suffix: "P" },
  { divider: 1e12, suffix: "T" },
  { divider: 1e9, suffix: "G" },
  { divider: 1e6, suffix: "M" },
  { divider: 1e3, suffix: "k" },
];

export const formatNumber = (value: number, decimalPlaces: number) => {
  for (const range of ranges) {
    if (value < range.divider) continue;

    return (value / range.divider).toFixed(decimalPlaces) + range.suffix;
  }
  return value.toFixed(decimalPlaces);
};

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 *  Number of bytes to si format. (Division by 1024)
 *  Does not accept floats, size in bytes should be an integer.
 *  Will return "NaI" and logs a warning if a float is passed.
 *  Concat as parameters so it is not added if the returned value is "NaI" or "∞".
 *  Returns "∞" if the size is too large to be represented in the current format.
 */
export const humanFileSize = (size: number, concat = ""): string => {
  //64bit limit for Number stops at EiB
  const siRanges = ["B", "kiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
  if (!Number.isInteger(size)) {
    console.warn(
      "Invalid use of the humanFileSize function with a float, please report this and what integration this is impacting.",
    );
    //Not an Integer
    return "NaI";
  }
  let count = 0;
  while (count < siRanges.length) {
    const tempSize = size / Math.pow(1024, count);
    if (tempSize < 1024) {
      return tempSize.toFixed(Math.min(count, 1)) + siRanges[count] + concat;
    }
    count++;
  }
  return "∞";
};

const IMPERIAL_MULTIPLIER = 1.609344;

export const metricToImperial = (metricValue: number) => metricValue / IMPERIAL_MULTIPLIER;
export const imperialToMetric = (imperialValue: number) => imperialValue * IMPERIAL_MULTIPLIER;
