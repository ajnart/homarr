"use client";

import { useCallback } from "react";
import { Button } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal } from "@homarr/modals";
import { useI18n, useScopedI18n } from "@homarr/translation/client";

interface RemoveGroupMemberProps {
  groupId: string;
  user: { id: string; name: string | null };
}

export const RemoveGroupMember = ({ groupId, user }: RemoveGroupMemberProps) => {
  const t = useI18n();
  const tRemoveMember = useScopedI18n("group.action.removeMember");
  const { mutateAsync } = clientApi.group.removeMember.useMutation();
  const { openConfirmModal } = useConfirmModal();

  const handleRemove = useCallback(() => {
    openConfirmModal({
      title: tRemoveMember("label"),
      children: tRemoveMember("confirm", {
        user: user.name ?? "",
      }),
      // eslint-disable-next-line no-restricted-syntax
      onConfirm: async () => {
        await mutateAsync({
          groupId,
          userId: user.id,
        });
        await revalidatePathActionAsync(`/manage/users/groups/${groupId}/members`);
      },
    });
  }, [openConfirmModal, mutateAsync, groupId, user.id, user.name, tRemoveMember]);

  return (
    <Button variant="subtle" color="red.9" size="compact-sm" onClick={handleRemove}>
      {t("common.action.remove")}
    </Button>
  );
};
