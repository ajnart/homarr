import type { User } from "@homarr/db/schema";
import type { ServerSettings } from "@homarr/server-settings";

export type SettingsContextProps = Pick<
  User,
  | "firstDayOfWeek"
  | "defaultSearchEngineId"
  | "homeBoardId"
  | "mobileHomeBoardId"
  | "openSearchInNewTab"
  | "pingIconsEnabled"
> &
  Pick<ServerSettings["board"], "enableStatusByDefault" | "forceDisableStatus"> &
  Pick<ServerSettings["user"], "enableGravatar">;

export interface PublicServerSettings {
  search: Pick<ServerSettings["search"], "defaultSearchEngineId">;
  board: Pick<
    ServerSettings["board"],
    "homeBoardId" | "mobileHomeBoardId" | "enableStatusByDefault" | "forceDisableStatus"
  >;
  user: Pick<ServerSettings["user"], "enableGravatar">;
}

export type UserSettings = Pick<
  User,
  | "firstDayOfWeek"
  | "defaultSearchEngineId"
  | "homeBoardId"
  | "mobileHomeBoardId"
  | "openSearchInNewTab"
  | "pingIconsEnabled"
>;

export const createSettings = ({
  user,
  serverSettings,
}: {
  user: UserSettings | null;
  serverSettings: PublicServerSettings;
}) => ({
  defaultSearchEngineId: user?.defaultSearchEngineId ?? serverSettings.search.defaultSearchEngineId,
  openSearchInNewTab: user?.openSearchInNewTab ?? true,
  firstDayOfWeek: user?.firstDayOfWeek ?? (1 as const),
  homeBoardId: user?.homeBoardId ?? serverSettings.board.homeBoardId,
  mobileHomeBoardId: user?.mobileHomeBoardId ?? serverSettings.board.mobileHomeBoardId,
  pingIconsEnabled: user?.pingIconsEnabled ?? false,
  enableStatusByDefault: serverSettings.board.enableStatusByDefault,
  forceDisableStatus: serverSettings.board.forceDisableStatus,
  enableGravatar: serverSettings.user.enableGravatar,
});
