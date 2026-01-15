import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@homarr/api";

type RouterOutput = inferRouterOutputs<AppRouter>;
type IconGroupsOutput = RouterOutput["icon"]["findIcons"]["icons"];

export const findBestIconMatch = (searchTerm: string, iconGroups: IconGroupsOutput): string | null => {
  const nameLower = searchTerm.toLowerCase();
  const allIcons = iconGroups.flatMap((group) => group.icons);

  const getIconPriority = (iconUrl: string) => {
    const fileName = iconUrl.toLowerCase().split("/").pop()?.split(".")[0];
    if (!fileName) return -1;

    const isSvg = iconUrl.endsWith(".svg");
    const isExactMatch = fileName === nameLower;

    if (isExactMatch) return isSvg ? 0 : 1;
    if (fileName.includes(nameLower)) return isSvg ? 2 : 3;
    return -1;
  };

  for (let priority = 0; priority <= 3; priority++) {
    const match = allIcons.find((icon) => getIconPriority(icon.url) === priority);
    if (match) return match.url;
  }

  return null;
};
