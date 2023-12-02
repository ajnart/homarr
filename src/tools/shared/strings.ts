export const trimStringEnding = (original: string, toTrimIfExists: string[]) => {
  for (let i = 0; i < toTrimIfExists.length; i += 1) {
    if (!original.endsWith(toTrimIfExists[i])) {
      continue;
    }
    return original.substring(0, original.indexOf(toTrimIfExists[i]));
  }

  return original;
};

export const firstUpperCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const appendPath = (url: URL, path: string) => {
  const newUrl = new URL(url);
  newUrl.pathname += path;
  return newUrl;
}
