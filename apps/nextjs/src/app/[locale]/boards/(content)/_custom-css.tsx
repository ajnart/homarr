"use client";

import { useRequiredBoard } from "@homarr/boards/context";

export const CustomCss = () => {
  const board = useRequiredBoard();

  return <style>{board.customCss}</style>;
};
