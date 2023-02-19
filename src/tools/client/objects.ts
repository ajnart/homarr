export const mapObject = <T, R>(
  items: Record<string, T>,
  mapper: (prop: string, item: T) => R
): Record<string, R> =>
  Object.fromEntries(Object.entries(items).map(([name, item]) => [name, mapper(name, item)]));
