import type { Board } from "~/app/[locale]/boards/_types";

export interface RemoveItemInput {
  itemId: string;
}

export const removeItemCallback =
  ({ itemId }: RemoveItemInput) =>
  (board: Board): Board => ({
    ...board,
    items: board.items.filter((item) => item.id !== itemId),
  });
