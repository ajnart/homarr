export function loadConfig(path: string): Config | null {
  const item = localStorage.getItem(path);
  if (!item) {
    return null;
  }

  try {
    return JSON.parse(item) as Config;
  } catch (e) {
    return null;
  }
}

export interface Config {
  searchUrl: string;
	searchBar: boolean,
}