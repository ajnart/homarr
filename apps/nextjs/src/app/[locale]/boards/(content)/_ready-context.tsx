"use client";

import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";

const BoardReadyContext = createContext<{
  isReady: boolean;
  markAsReady: (id: string) => void;
} | null>(null);

export const BoardReadyProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const utils = clientApi.useUtils();
  const board = useRequiredBoard();
  const [readySections, setReadySections] = useState<string[]>([]);

  // Reset sections required for ready state
  useEffect(() => {
    return () => {
      setReadySections([]);
    };
  }, [pathname, utils]);

  useEffect(() => {
    setReadySections((previous) => previous.filter((id) => board.sections.some((section) => section.id === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.sections.length, setReadySections]);

  const markAsReady = useCallback((id: string) => {
    setReadySections((previous) => (previous.includes(id) ? previous : [...previous, id]));
  }, []);

  return (
    <BoardReadyContext.Provider
      value={{
        isReady: board.sections.length === readySections.length,
        markAsReady,
      }}
    >
      {children}
    </BoardReadyContext.Provider>
  );
};

export const useMarkSectionAsReady = () => {
  const context = useContext(BoardReadyContext);

  if (!context) {
    throw new Error("BoardReadyProvider is required");
  }

  return context.markAsReady;
};

export const useIsBoardReady = () => {
  const context = useContext(BoardReadyContext);

  if (!context) {
    throw new Error("BoardReadyProvider is required");
  }

  return context.isReady;
};
