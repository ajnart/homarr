import { useCallback } from "react";

import { useUpdateBoard } from "@homarr/boards/updater";
import { createId } from "@homarr/common";

import type { CategorySection, EmptySection, Section } from "~/app/[locale]/boards/_types";
import type { MoveCategoryInput } from "./actions/move-category";
import { moveCategoryCallback } from "./actions/move-category";
import type { RemoveCategoryInput } from "./actions/remove-category";
import { removeCategoryCallback } from "./actions/remove-category";

interface AddCategory {
  name: string;
  yOffset: number;
}

interface RenameCategory {
  id: string;
  name: string;
}

export const useCategoryActions = () => {
  const { updateBoard } = useUpdateBoard();

  const addCategory = useCallback(
    ({ name, yOffset }: AddCategory) => {
      if (yOffset <= -1) {
        return;
      }
      updateBoard((previous) => ({
        ...previous,
        sections: [
          // Place sections before the new category
          ...previous.sections.filter(
            (section) => (section.kind === "category" || section.kind === "empty") && section.yOffset < yOffset,
          ),
          {
            id: createId(),
            name,
            kind: "category",
            yOffset,
            xOffset: 0,
            collapsed: false,
          },
          {
            id: createId(),
            kind: "empty",
            yOffset: yOffset + 1,
            xOffset: 0,
          },
          // Place sections after the new category
          ...previous.sections
            .filter(
              (section): section is CategorySection | EmptySection =>
                (section.kind === "category" || section.kind === "empty") && section.yOffset >= yOffset,
            )
            .map((section) => ({
              ...section,
              yOffset: section.yOffset + 2,
            })),
        ] satisfies Section[],
      }));
    },
    [updateBoard],
  );

  const addCategoryToEnd = useCallback(
    ({ name }: { name: string }) => {
      updateBoard((previous) => {
        const lastSection = previous.sections
          .filter(
            (section): section is CategorySection | EmptySection =>
              section.kind === "empty" || section.kind === "category",
          )
          .sort((sectionA, sectionB) => sectionB.yOffset - sectionA.yOffset)
          .at(0);

        if (!lastSection) return previous;
        const lastYOffset = lastSection.yOffset;

        return {
          ...previous,
          sections: [
            ...previous.sections,
            {
              id: createId(),
              name,
              kind: "category",
              yOffset: lastYOffset + 1,
              xOffset: 0,
              collapsed: false,
            },
            {
              id: createId(),
              kind: "empty",
              yOffset: lastYOffset + 2,
              xOffset: 0,
            },
          ] satisfies Section[],
        };
      });
    },
    [updateBoard],
  );

  const renameCategory = useCallback(
    ({ id: categoryId, name }: RenameCategory) => {
      updateBoard((previous) => ({
        ...previous,
        sections: previous.sections.map((section) => {
          if (section.kind !== "category") return section;
          if (section.id !== categoryId) return section;
          return {
            ...section,
            name,
          };
        }),
      }));
    },
    [updateBoard],
  );

  const moveCategory = useCallback(
    (input: MoveCategoryInput) => {
      updateBoard(moveCategoryCallback(input));
    },
    [updateBoard],
  );

  const removeCategory = useCallback(
    (input: RemoveCategoryInput) => {
      updateBoard(removeCategoryCallback(input));
    },
    [updateBoard],
  );

  return {
    addCategory,
    addCategoryToEnd,
    renameCategory,
    moveCategory,
    removeCategory,
  };
};
