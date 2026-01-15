export const capitalize = <T extends string>(str: T) => {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
};

export const isNullOrWhitespace = (value: string | null): value is null => {
  return value == null || value.trim() === "";
};
