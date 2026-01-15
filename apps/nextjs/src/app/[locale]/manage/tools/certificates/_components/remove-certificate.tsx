"use client";

import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";

interface RemoveCertificateProps {
  fileName: string;
}

export const RemoveCertificate = ({ fileName }: RemoveCertificateProps) => {
  const { openConfirmModal } = useConfirmModal();
  const { mutateAsync } = clientApi.certificates.removeCertificate.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/manage/tools/certificates");
    },
  });
  const t = useI18n();

  const handleClick = () => {
    openConfirmModal({
      title: t("certificate.action.remove.label"),
      children: t("certificate.action.remove.confirm"),
      // eslint-disable-next-line no-restricted-syntax
      async onConfirm() {
        await mutateAsync(
          { fileName },
          {
            onSuccess() {
              showSuccessNotification({
                title: t("certificate.action.remove.notification.success.title"),
                message: t("certificate.action.remove.notification.success.message"),
              });
            },
            onError() {
              showErrorNotification({
                title: t("certificate.action.remove.notification.error.title"),
                message: t("certificate.action.remove.notification.error.message"),
              });
            },
          },
        );
      },
    });
  };

  return (
    <ActionIcon onClick={handleClick} color="red" variant="subtle">
      <IconTrash color="red" size={16} />
    </ActionIcon>
  );
};
