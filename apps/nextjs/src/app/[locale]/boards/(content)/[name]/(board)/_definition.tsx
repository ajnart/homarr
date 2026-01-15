import { api } from "@homarr/api/server";

import { createBoardContentPage } from "../../_creator";

export default createBoardContentPage<{ locale: string; name: string }>({
  async getInitialBoardAsync({ name }) {
    return await api.board.getBoardByName({ name });
  },
});
