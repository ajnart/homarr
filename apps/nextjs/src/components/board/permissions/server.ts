import { auth } from "@homarr/auth/next";
import type { BoardPermissionsProps } from "@homarr/auth/shared";
import { constructBoardPermissions } from "@homarr/auth/shared";

export const getBoardPermissionsAsync = async (board: BoardPermissionsProps) => {
  const session = await auth();
  return constructBoardPermissions(board, session);
};
