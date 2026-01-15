import { IconHomeOff } from "@tabler/icons-react";

import { auth } from "@homarr/auth/next";
import { db } from "@homarr/db";
import { boards } from "@homarr/db/schema";
import { getI18n } from "@homarr/translation/server";

import type { BoardNotFoundProps } from "~/components/board/not-found";
import { BoardNotFound } from "~/components/board/not-found";

export default async function NotFoundBoardHomePage() {
  const boardNotFoundProps = await getPropsAsync();

  return <BoardNotFound {...boardNotFoundProps} />;
}

const getPropsAsync = async (): Promise<BoardNotFoundProps> => {
  const boardCount = await db.$count(boards);
  const t = await getI18n();

  if (boardCount === 0) {
    return {
      icon: { src: "/favicon.ico", alt: "Homarr logo" },
      title: t("board.error.noBoard.title"),
      description: t("board.error.noBoard.description"),
      link: { label: t("board.error.noBoard.link"), href: "/manage/boards" },
      notice: t("board.error.noBoard.notice"),
    };
  }

  const session = await auth();
  const isAdmin = session?.user.permissions.includes("admin");
  const type = isAdmin ? "admin" : session !== null ? "user" : "anonymous";
  const href = {
    admin: "/manage/settings",
    user: `/manage/users/${session?.user.id}/general`,
    anonymous: "/manage/boards",
  }[type];

  return {
    icon: IconHomeOff,
    title: t(`board.error.homeBoard.title`),
    description: t(`board.error.homeBoard.${type}.description`),
    link: { label: t(`board.error.homeBoard.${type}.link`), href },
    notice: t(`board.error.homeBoard.${type}.notice`),
  };
};
