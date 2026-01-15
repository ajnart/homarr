import { clientApi } from "@homarr/api/client";

import type { Board } from "../../_types";

export const useSavePartialSettingsMutation = (board: Board) => {
  const utils = clientApi.useUtils();
  return clientApi.board.savePartialBoardSettings.useMutation({
    onSettled() {
      void utils.board.getBoardByName.invalidate({ name: board.name });
      void utils.board.getHomeBoard.invalidate();
    },
  });
};
