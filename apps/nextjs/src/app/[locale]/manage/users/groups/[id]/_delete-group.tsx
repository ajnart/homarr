"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, useMatches } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n, useScopedI18n } from "@homarr/translation/client";

interface DeleteGroupProps {
  group: {
    id: string;
    name: string;
  };
}

export const DeleteGroup = ({ group }: DeleteGroupProps) => {
  const router = useRouter();
  const { mutateAsync } = clientApi.group.deleteGroup.useMutation();
  const { openConfirmModal } = useConfirmModal();
  const tDelete = useScopedI18n("group.action.delete");
  const tRoot = useI18n();

  const handleDeletion = useCallback(() => {
    openConfirmModal({
      title: tDelete("label"),
      children: tDelete("confirm", {
        name: group.name,
      }),
      // eslint-disable-next-line no-restricted-syntax
      async onConfirm() {
        await mutateAsync(
          {
            id: group.id,
          },
          {
            onSuccess() {
              void revalidatePathActionAsync("/manage/users/groups");
              router.push("/manage/users/groups");
              showSuccessNotification({
                title: tRoot("common.notification.delete.success"),
                message: tDelete("notification.success.message", {
                  name: group.name,
                }),
              });
            },
            onError() {
              showErrorNotification({
                title: tRoot("common.notification.delete.error"),
                message: tDelete("notification.error.message", {
                  name: group.name,
                }),
              });
            },
          },
        );
      },
    });
  }, [tDelete, tRoot, openConfirmModal, group.id, group.name, mutateAsync, router]);

  const fullWidth = useMatches({
    xs: true,
    sm: true,
    md: false,
  });

  return (
    <Button variant="subtle" color="red" onClick={handleDeletion} fullWidth={fullWidth}>
      {tDelete("label")}
    </Button>
  );
};
