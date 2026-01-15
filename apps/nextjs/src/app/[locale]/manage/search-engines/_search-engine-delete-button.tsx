"use client";

import { useCallback } from "react";
import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useScopedI18n } from "@homarr/translation/client";

interface SearchEngineDeleteButtonProps {
  searchEngine: RouterOutputs["searchEngine"]["getPaginated"]["items"][number];
}

export const SearchEngineDeleteButton = ({ searchEngine }: SearchEngineDeleteButtonProps) => {
  const t = useScopedI18n("search.engine.page.delete");
  const { openConfirmModal } = useConfirmModal();
  const { mutate, isPending } = clientApi.searchEngine.delete.useMutation();

  const onClick = useCallback(() => {
    openConfirmModal({
      title: t("title"),
      children: t("message", {
        name: searchEngine.name,
      }),
      onConfirm: () => {
        mutate(
          { id: searchEngine.id },
          {
            onSuccess: () => {
              showSuccessNotification({
                title: t("notification.success.title"),
                message: t("notification.success.message"),
              });
              void revalidatePathActionAsync("/manage/search-engines");
            },
            onError: () => {
              showErrorNotification({
                title: t("notification.error.title"),
                message: t("notification.error.message"),
              });
            },
          },
        );
      },
    });
  }, [searchEngine, mutate, t, openConfirmModal]);

  return (
    <ActionIcon loading={isPending} variant="subtle" color="red" onClick={onClick} aria-label={t("title")}>
      <IconTrash color="red" size={16} stroke={1.5} />
    </ActionIcon>
  );
};
