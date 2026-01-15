"use client";

import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";

interface RemoveHostnameActionIconProps {
  hostname: string;
  thumbprint: string;
}

export const RemoveHostnameActionIcon = (input: RemoveHostnameActionIconProps) => {
  const { mutateAsync } = clientApi.certificates.removeTrustedHostname.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/manage/tools/certificates/hostnames");
    },
  });
  const { openConfirmModal } = useConfirmModal();
  const t = useI18n();

  const handleRemove = () => {
    openConfirmModal({
      title: t("certificate.action.removeHostname.label"),
      children: t("certificate.action.removeHostname.confirm"),
      // eslint-disable-next-line no-restricted-syntax
      async onConfirm() {
        await mutateAsync(input, {
          onSuccess() {
            showSuccessNotification({
              title: t("certificate.action.removeHostname.notification.success.title"),
              message: t("certificate.action.removeHostname.notification.success.message"),
            });
          },
          onError() {
            showErrorNotification({
              title: t("certificate.action.removeHostname.notification.error.title"),
              message: t("certificate.action.removeHostname.notification.error.message"),
            });
          },
        });
      },
    });
  };

  return (
    <ActionIcon color="red" variant="subtle" onClick={handleRemove}>
      <IconTrash color="red" size={16} stroke={1.5} />
    </ActionIcon>
  );
};
