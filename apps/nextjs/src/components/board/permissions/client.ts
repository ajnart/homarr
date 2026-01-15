import { useSession } from "@homarr/auth/client";
import type { BoardPermissionsProps } from "@homarr/auth/shared";
import { constructBoardPermissions } from "@homarr/auth/shared";

export const useBoardPermissions = (board: BoardPermissionsProps) => {
  const { data: session } = useSession();
  return constructBoardPermissions(board, session);
};
