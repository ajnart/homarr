const ranges = [
  { divider: 1e18, suffix: 'E' },
  { divider: 1e15, suffix: 'P' },
  { divider: 1e12, suffix: 'T' },
  { divider: 1e9, suffix: 'G' },
  { divider: 1e6, suffix: 'M' },
  { divider: 1e3, suffix: 'k' },
];

export const formatNumber = (n: number, decimalPlaces: number) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const range of ranges) {
    if (n < range.divider) continue;

    return (n / range.divider).toFixed(decimalPlaces) + range.suffix;
  }
  return n.toFixed(decimalPlaces);
};

export const formatPercentage = (n: number, decimalPlaces: number) => {
  return `${(n * 100).toFixed(decimalPlaces)}%`;
};
