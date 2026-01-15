"use client";

import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";

import { updateBoardName } from "./updater";

const BoardContext = createContext<{
  board: RouterOutputs["board"]["getBoardByName"];
} | null>(null);

export const BoardProvider = ({
  children,
  initialBoard,
}: PropsWithChildren<{
  initialBoard: RouterOutputs["board"]["getBoardByName"];
}>) => {
  const { data } = clientApi.board.getBoardByName.useQuery(
    { name: initialBoard.name },
    {
      initialData: initialBoard,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  // Update the board name so it can be used within updateBoard method
  updateBoardName(initialBoard.name);

  const pathname = usePathname();
  const utils = clientApi.useUtils();

  // Invalidate the board when the pathname changes
  // This allows to refetch the board when it might have changed - e.g. if someone else added an item
  useEffect(() => {
    return () => {
      void utils.board.getBoardByName.invalidate({ name: initialBoard.name });
    };
  }, [pathname, utils, initialBoard.name]);

  return (
    <BoardContext.Provider
      value={{
        board: data,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useRequiredBoard = () => {
  const optionalBoard = useOptionalBoard();

  if (!optionalBoard) {
    throw new Error("Board is required");
  }

  return optionalBoard;
};

export const useOptionalBoard = () => {
  const context = useContext(BoardContext);

  return context?.board ?? null;
};

export const getCurrentLayout = (board: RouterOutputs["board"]["getBoardByName"]) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (typeof window === "undefined") return board.layouts.at(0)!.id;

  const sortedLayouts = board.layouts.sort((layoutA, layoutB) => layoutB.breakpoint - layoutA.breakpoint);

  // Fallback to smallest if none exists with breakpoint smaller than window width
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return sortedLayouts.find((layout) => layout.breakpoint <= window.innerWidth)?.id ?? sortedLayouts.at(0)!.id;
};

export const useCurrentLayout = () => {
  const board = useRequiredBoard();
  const [currentLayout, setCurrentLayout] = useState(getCurrentLayout(board));

  const onResize = useCallback(() => {
    setCurrentLayout(getCurrentLayout(board));
  }, [board]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  return currentLayout;
};

export const getBoardLayouts = (board: RouterOutputs["board"]["getBoardByName"]) =>
  board.layouts.map((layout) => layout.id);

export const useLayouts = () => {
  const board = useRequiredBoard();

  return getBoardLayouts(board);
};
