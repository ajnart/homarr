import { useCallback } from "react";

import { useUpdateBoard } from "@homarr/boards/updater";
import type { BoardItemAdvancedOptions } from "@homarr/validation/shared";

import type { CreateItemInput } from "./actions/create-item";
import { createItemCallback } from "./actions/create-item";
import type { DuplicateItemInput } from "./actions/duplicate-item";
import { duplicateItemCallback } from "./actions/duplicate-item";
import type { MoveAndResizeItemInput } from "./actions/move-and-resize-item";
import { moveAndResizeItemCallback } from "./actions/move-and-resize-item";
import type { MoveItemToSectionInput } from "./actions/move-item-to-section";
import { moveItemToSectionCallback } from "./actions/move-item-to-section";
import type { RemoveItemInput } from "./actions/remove-item";
import { removeItemCallback } from "./actions/remove-item";

interface UpdateItemOptions {
  itemId: string;
  newOptions: Record<string, unknown>;
}

interface UpdateItemAdvancedOptions {
  itemId: string;
  newAdvancedOptions: BoardItemAdvancedOptions;
}

interface UpdateItemIntegrations {
  itemId: string;
  newIntegrations: string[];
}

export const useItemActions = () => {
  const { updateBoard } = useUpdateBoard();

  const createItem = useCallback(
    (input: CreateItemInput) => {
      updateBoard(createItemCallback(input));
    },
    [updateBoard],
  );

  const duplicateItem = useCallback(
    ({ itemId }: DuplicateItemInput) => {
      updateBoard(duplicateItemCallback({ itemId }));
    },
    [updateBoard],
  );

  const updateItemOptions = useCallback(
    ({ itemId, newOptions }: UpdateItemOptions) => {
      updateBoard((previous) => ({
        ...previous,
        items: previous.items.map((item) => (item.id !== itemId ? item : { ...item, options: newOptions })),
      }));
    },
    [updateBoard],
  );

  const updateItemAdvancedOptions = useCallback(
    ({ itemId, newAdvancedOptions }: UpdateItemAdvancedOptions) => {
      updateBoard((previous) => ({
        ...previous,
        items: previous.items.map((item) =>
          item.id !== itemId ? item : { ...item, advancedOptions: newAdvancedOptions },
        ),
      }));
    },
    [updateBoard],
  );

  const updateItemIntegrations = useCallback(
    ({ itemId, newIntegrations }: UpdateItemIntegrations) => {
      updateBoard((previous) => ({
        ...previous,
        items: previous.items.map((item) =>
          item.id !== itemId || !("integrationIds" in item) ? item : { ...item, integrationIds: newIntegrations },
        ),
      }));
    },
    [updateBoard],
  );

  const moveAndResizeItem = useCallback(
    (input: MoveAndResizeItemInput) => {
      updateBoard(moveAndResizeItemCallback(input));
    },
    [updateBoard],
  );

  const moveItemToSection = useCallback(
    (input: MoveItemToSectionInput) => {
      updateBoard(moveItemToSectionCallback(input));
    },
    [updateBoard],
  );

  const removeItem = useCallback(
    ({ itemId }: RemoveItemInput) => {
      updateBoard(removeItemCallback({ itemId }));
    },
    [updateBoard],
  );

  return {
    moveAndResizeItem,
    moveItemToSection,
    removeItem,
    updateItemOptions,
    updateItemAdvancedOptions,
    updateItemIntegrations,
    duplicateItem,
    createItem,
  };
};
