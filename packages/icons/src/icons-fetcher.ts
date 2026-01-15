import { GitHubIconRepository } from "./repositories/github.icon-repository";
import { JsdelivrIconRepository } from "./repositories/jsdelivr.icon-repository";
import { LocalIconRepository } from "./repositories/local.icon-repository";
import type { RepositoryIconGroup } from "./types";

const repositories = [
  new GitHubIconRepository(
    "Dashboard Icons",
    "homarr-labs/dashboard-icons",
    undefined,
    new URL("https://github.com/homarr-labs/dashboard-icons"),
    new URL("https://api.github.com/repos/homarr-labs/dashboard-icons/git/trees/main?recursive=true"),
    "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/{0}",
  ),
  new GitHubIconRepository(
    "selfh.st",
    "selfhst/icons",
    "CC0-1.0",
    new URL("https://github.com/selfhst/icons"),
    new URL("https://api.github.com/repos/selfhst/icons/git/trees/main?recursive=true"),
    "https://cdn.jsdelivr.net/gh/selfhst/icons/{0}",
  ),
  new GitHubIconRepository(
    "SimpleIcons",
    "simple-icons/simple-icons",
    "CC0-1.0",
    new URL("https://github.com/simple-icons/simple-icons"),
    new URL("https://api.github.com/repos/simple-icons/simple-icons/git/trees/master?recursive=true"),
    "https://cdn.simpleicons.org/{1}",
  ),
  new JsdelivrIconRepository(
    "Papirus",
    "PapirusDevelopmentTeam/papirus-icon-theme",
    "GPL-3.0",
    new URL("https://github.com/PapirusDevelopmentTeam/papirus-icon-theme"),
    new URL("https://data.jsdelivr.com/v1/packages/gh/PapirusDevelopmentTeam/papirus_icons@master?structure=flat"),
    "https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus_icons/{0}",
  ),
  new JsdelivrIconRepository(
    "Homelab SVG assets",
    "loganmarchione/homelab-svg-assets",
    "MIT",
    new URL("https://github.com/loganmarchione/homelab-svg-assets"),
    new URL("https://data.jsdelivr.com/v1/packages/gh/loganmarchione/homelab-svg-assets@main?structure=flat"),
    "https://cdn.jsdelivr.net/gh/loganmarchione/homelab-svg-assets/{0}",
  ),
  new LocalIconRepository(),
];

export const fetchIconsAsync = async (): Promise<RepositoryIconGroup[]> => {
  return await Promise.all(repositories.map(async (repository) => await repository.getAllIconsAsync()));
};
