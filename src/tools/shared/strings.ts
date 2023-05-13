export const trimStringEnding = (original: string, toTrimIfExists: string[]) => {
  for (let i = 0; i < toTrimIfExists.length; i += 1) {
    if (!original.endsWith(toTrimIfExists[i])) {
      continue;
    }
    return original.substring(0, original.indexOf(toTrimIfExists[i]));
  }

  return original;
};
