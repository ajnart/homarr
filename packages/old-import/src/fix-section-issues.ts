import { createId } from "@homarr/common";
import { createLogger } from "@homarr/core/infrastructure/logs";
import type { OldmarrConfig } from "@homarr/old-schema";

const logger = createLogger({ module: "fixSectionIssues" });

export const fixSectionIssues = (old: OldmarrConfig) => {
  const wrappers = old.wrappers.sort((wrapperA, wrapperB) => wrapperA.position - wrapperB.position);
  const categories = old.categories.sort((categoryA, categoryB) => categoryA.position - categoryB.position);

  const neededSectionCount = categories.length * 2 + 1;
  const hasToMuchEmptyWrappers = wrappers.length > categories.length + 1;

  logger.debug("Fixing section issues", {
    neededSectionCount,
    hasToMuchEmptyWrappers,
  });

  for (let position = 0; position < neededSectionCount; position++) {
    const index = Math.floor(position / 2);
    const isEmpty = position % 2 === 0;
    const section = isEmpty ? wrappers[index] : categories[index];
    if (!section) {
      // If there are not enough empty sections for categories we need to insert them
      if (isEmpty) {
        // Insert empty wrapper for between categories
        wrappers.push({
          id: createId(),
          position,
        });
      }
      continue;
    }

    section.position = position;
  }

  // Find all wrappers that should be merged into one
  const wrapperIdsToMerge = wrappers.slice(categories.length).map((section) => section.id);
  // Remove all wrappers after the first at the end
  wrappers.splice(categories.length + 1);

  if (wrapperIdsToMerge.length >= 2) {
    logger.debug("Found wrappers to merge", { count: wrapperIdsToMerge.length });
  }

  return {
    wrappers,
    categories,
    wrapperIdsToMerge,
  };
};
