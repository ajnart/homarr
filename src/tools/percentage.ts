export const percentage = (partialValue: number, totalValue: number) => {
  return ((100 * partialValue) / totalValue).toFixed(1);
};
