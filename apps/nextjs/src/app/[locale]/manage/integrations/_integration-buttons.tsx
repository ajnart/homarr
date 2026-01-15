"use client";

import { useRouter } from "next/navigation";
import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useScopedI18n } from "@homarr/translation/client";

interface DeleteIntegrationActionButtonProps {
  count: number;
  integration: { id: string; name: string };
}

export const DeleteIntegrationActionButton = ({ count, integration }: DeleteIntegrationActionButtonProps) => {
  const t = useScopedI18n("integration.page.delete");
  const router = useRouter();
  const { openConfirmModal } = useConfirmModal();
  const { mutateAsync, isPending } = clientApi.integration.delete.useMutation();

  return (
    <ActionIcon
      loading={isPending}
      variant="subtle"
      color="red"
      onClick={() => {
        openConfirmModal({
          title: t("title"),
          children: t("message", integration),
          onConfirm: () => {
            void mutateAsync(
              { id: integration.id },
              {
                onSuccess: () => {
                  showSuccessNotification({
                    title: t("notification.success.title"),
                    message: t("notification.success.message"),
                  });
                  if (count === 1) {
                    router.replace("/manage/integrations");
                  }
                  void revalidatePathActionAsync("/manage/integrations");
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
      }}
      aria-label={t("title")}
    >
      <IconTrash color="red" size={16} stroke={1.5} />
    </ActionIcon>
  );
};
