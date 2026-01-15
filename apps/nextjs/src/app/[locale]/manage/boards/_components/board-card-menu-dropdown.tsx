"use client";

import { useCallback } from "react";
import { Menu } from "@mantine/core";
import { IconCopy, IconDeviceMobile, IconHome, IconSettings, IconTrash } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useSession } from "@homarr/auth/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal, useModalAction } from "@homarr/modals";
import { DuplicateBoardModal } from "@homarr/modals-collection";
import { useScopedI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

import { useBoardPermissions } from "~/components/board/permissions/client";

const iconProps = {
  size: 16,
  stroke: 1.5,
};

interface BoardCardMenuDropdownProps {
  board: Pick<
    RouterOutputs["board"]["getAllBoards"][number],
    "id" | "name" | "creator" | "userPermissions" | "groupPermissions" | "isPublic"
  >;
}

export const BoardCardMenuDropdown = ({ board }: BoardCardMenuDropdownProps) => {
  const t = useScopedI18n("management.page.board.action");
  const tCommon = useScopedI18n("common");

  const { hasFullAccess, hasChangeAccess } = useBoardPermissions(board);
  const { data: session } = useSession();

  const { openConfirmModal } = useConfirmModal();
  const { openModal: openDuplicateModal } = useModalAction(DuplicateBoardModal);

  const setHomeBoardMutation = clientApi.board.setHomeBoard.useMutation({
    onSettled: async () => {
      // Revalidate all as it's part of the user settings, /boards page and board manage page
      await revalidatePathActionAsync("/");
    },
  });
  const setMobileHomeBoardMutation = clientApi.board.setMobileHomeBoard.useMutation({
    onSettled: async () => {
      // Revalidate all as it's part of the user settings, /boards page and board manage page
      await revalidatePathActionAsync("/");
    },
  });
  const deleteBoardMutation = clientApi.board.deleteBoard.useMutation({
    onSettled: async () => {
      await revalidatePathActionAsync("/manage/boards");
    },
  });

  const handleDeletion = useCallback(() => {
    openConfirmModal({
      title: t("delete.confirm.title"),
      children: t("delete.confirm.description", {
        name: board.name,
      }),
      // eslint-disable-next-line no-restricted-syntax
      onConfirm: async () => {
        await deleteBoardMutation.mutateAsync({
          id: board.id,
        });
      },
    });
  }, [board.id, board.name, deleteBoardMutation, openConfirmModal, t]);

  const handleSetHomeBoard = useCallback(async () => {
    await setHomeBoardMutation.mutateAsync({ id: board.id });
  }, [board.id, setHomeBoardMutation]);

  const handleSetMobileHomeBoard = useCallback(async () => {
    await setMobileHomeBoardMutation.mutateAsync({ id: board.id });
  }, [board.id, setMobileHomeBoardMutation]);

  const handleDuplicateBoard = useCallback(() => {
    openDuplicateModal({
      board: {
        id: board.id,
        name: board.name,
      },
    });
  }, [board.id, board.name, openDuplicateModal]);

  return (
    <Menu.Dropdown>
      <Menu.Item onClick={handleSetHomeBoard} leftSection={<IconHome {...iconProps} />}>
        {t("setHomeBoard.label")}
      </Menu.Item>
      <Menu.Item onClick={handleSetMobileHomeBoard} leftSection={<IconDeviceMobile {...iconProps} />}>
        {t("setMobileHomeBoard.label")}
      </Menu.Item>
      {session?.user.permissions.includes("board-create") && (
        <Menu.Item onClick={handleDuplicateBoard} leftSection={<IconCopy {...iconProps} />}>
          {t("duplicate.label")}
        </Menu.Item>
      )}
      {hasChangeAccess && (
        <>
          <Menu.Divider />
          <Menu.Item
            component={Link}
            href={`/boards/${board.name}/settings`}
            leftSection={<IconSettings {...iconProps} />}
          >
            {t("settings.label")}
          </Menu.Item>
        </>
      )}
      {hasFullAccess && (
        <>
          <Menu.Divider />
          <Menu.Label c="red.7">{tCommon("dangerZone")}</Menu.Label>
          <Menu.Item
            c="red.7"
            leftSection={<IconTrash {...iconProps} />}
            onClick={handleDeletion}
            disabled={deleteBoardMutation.isPending}
          >
            {t("delete.label")}
          </Menu.Item>
        </>
      )}
    </Menu.Dropdown>
  );
};
