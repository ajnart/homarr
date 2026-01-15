import type { RouterOutputs } from "@homarr/api";

import type { CategorySection } from "~/app/[locale]/boards/_types";

export interface MoveCategoryInput {
  id: string;
  direction: "up" | "down";
}

export const moveCategoryCallback =
  (input: MoveCategoryInput) =>
  (previous: RouterOutputs["board"]["getHomeBoard"]): RouterOutputs["board"]["getHomeBoard"] => {
    const currentCategory = previous.sections.find(
      (section): section is CategorySection => section.kind === "category" && section.id === input.id,
    );
    if (!currentCategory) {
      return previous;
    }
    if (currentCategory.yOffset === 1 && input.direction === "up") {
      return previous;
    }
    if (currentCategory.yOffset === previous.sections.length - 2 && input.direction === "down") {
      return previous;
    }

    return {
      ...previous,
      sections: previous.sections.map((section) => {
        if (section.kind !== "category" && section.kind !== "empty") {
          return section;
        }
        const offset = input.direction === "up" ? -2 : 2;
        // Move category and empty section
        if (section.yOffset === currentCategory.yOffset || section.yOffset === currentCategory.yOffset + 1) {
          return {
            ...section,
            yOffset: section.yOffset + offset,
          };
        }

        if (
          section.yOffset === currentCategory.yOffset + offset ||
          section.yOffset === currentCategory.yOffset + offset + 1
        ) {
          return {
            ...section,
            yOffset: section.yOffset - offset,
          };
        }

        return section;
      }),
    };
  };
