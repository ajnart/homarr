import { IconLayoutOff } from "@tabler/icons-react";

import { getScopedI18n } from "@homarr/translation/server";

import { BoardNotFound } from "~/components/board/not-found";

export default async function BoardNotFoundPage() {
  const tNotFound = await getScopedI18n("board.error.notFound");
  return (
    <BoardNotFound
      icon={IconLayoutOff}
      title={tNotFound("title")}
      description={tNotFound("description")}
      link={{ label: tNotFound("link"), href: "/manage/boards" }}
      notice={tNotFound("notice")}
    />
  );
}
