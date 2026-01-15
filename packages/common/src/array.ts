export const splitToNChunks = <T>(array: T[], chunks: number): T[][] => {
  const result: T[][] = [];
  for (let i = chunks; i > 0; i--) {
    result.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return result;
};

export const splitToChunksWithNItems = <T>(array: T[], itemCount: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += itemCount) {
    result.push(array.slice(i, i + itemCount));
  }
  return result;
};
