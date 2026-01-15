import type { BoardSize } from "@homarr/old-schema";

/**
 * Copied from https://github.com/ajnart/homarr/blob/274eaa92084a8be4d04a69a87f9920860a229128/src/components/Dashboard/Wrappers/gridstack/store.tsx#L21-L30
 * @param screenSize board size
 * @returns layout breakpoint for the board
 */
export const mapBreakpoint = (screenSize: BoardSize) => {
  switch (screenSize) {
    case "lg":
      return 1400;
    case "md":
      return 800;
    case "sm":
    default:
      return 0;
  }
};
