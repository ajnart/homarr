"use client";

import { IconEye, IconPencil, IconSettings } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { boardPermissions, boardPermissionsMap } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";

import { AccessSettings } from "~/components/access/access-settings";
import type { Board } from "../../_types";

interface Props {
  board: Board;
  initialPermissions: RouterOutputs["board"]["getBoardPermissions"];
}

export const BoardAccessSettings = ({ board, initialPermissions }: Props) => {
  const groupMutation = clientApi.board.saveGroupBoardPermissions.useMutation();
  const userMutation = clientApi.board.saveUserBoardPermissions.useMutation();
  const utils = clientApi.useUtils();
  const t = useI18n();

  const { data: permissions } = clientApi.board.getBoardPermissions.useQuery(
    {
      id: board.id,
    },
    {
      initialData: initialPermissions,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  return (
    <AccessSettings
      entity={{
        id: board.id,
        ownerId: board.creatorId,
        owner: board.creator,
      }}
      query={{
        invalidate: () => utils.board.getBoardPermissions.invalidate(),
        data: permissions,
      }}
      groupsMutation={{
        mutate: groupMutation.mutate,
        isPending: groupMutation.isPending,
      }}
      usersMutation={{
        mutate: userMutation.mutate,
        isPending: userMutation.isPending,
      }}
      translate={(key) => t(`board.setting.section.access.permission.item.${key}.label`)}
      permission={{
        items: boardPermissions,
        default: "view",
        fullAccessGroupPermission: "board-full-all",
        groupPermissionMapping: boardPermissionsMap,
        icons: {
          modify: IconPencil,
          view: IconEye,
          full: IconSettings,
        },
      }}
    />
  );
};
