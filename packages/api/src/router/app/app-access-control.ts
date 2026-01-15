import SuperJSON from "superjson";

import type { Session } from "@homarr/auth";
import { db, eq, or } from "@homarr/db";
import { items } from "@homarr/db/schema";

import type { WidgetComponentProps } from "../../../../widgets/src";

export const canUserSeeAppAsync = async (user: Session["user"] | null, appId: string) => {
  return await canUserSeeAppsAsync(user, [appId]);
};

export const canUserSeeAppsAsync = async (user: Session["user"] | null, appIds: string[]) => {
  if (user) return true;

  const appIdsOnPublicBoards = await getAllAppIdsOnPublicBoardsAsync();
  return appIds.every((appId) => appIdsOnPublicBoards.includes(appId));
};

const getAllAppIdsOnPublicBoardsAsync = async () => {
  const itemsWithApps = await db.query.items.findMany({
    where: or(eq(items.kind, "app"), eq(items.kind, "bookmarks")),
    with: {
      board: {
        columns: {
          isPublic: true,
        },
      },
    },
  });

  return itemsWithApps
    .filter((item) => item.board.isPublic)
    .flatMap((item) => {
      if (item.kind === "app") {
        const parsedOptions = SuperJSON.parse<WidgetComponentProps<"app">["options"]>(item.options);
        return [parsedOptions.appId];
      } else if (item.kind === "bookmarks") {
        const parsedOptions = SuperJSON.parse<WidgetComponentProps<"bookmarks">["options"]>(item.options);
        return parsedOptions.items;
      }

      throw new Error("Failed to get app ids from board. Invalid item kind: 'test'");
    });
};
