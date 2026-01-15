import { api } from "@homarr/api/server";

import { createBoardContentPage } from "../_creator";

export default createBoardContentPage<{ locale: string }>({
  async getInitialBoardAsync() {
    return await api.board.getHomeBoard();
  },
});
