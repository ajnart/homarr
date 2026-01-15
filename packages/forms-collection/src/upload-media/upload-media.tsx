import type { JSX } from "react";
import { FileButton } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import type { MaybePromise } from "@homarr/common/types";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { supportedMediaUploadFormats } from "@homarr/validation/media";

interface UploadMediaProps {
  children: (props: { onClick: () => void; loading: boolean }) => JSX.Element;
  multiple?: boolean;
  onSettled?: () => MaybePromise<void>;
  onSuccess?: (media: { id: string; url: string }[]) => MaybePromise<void>;
}

export const UploadMedia = ({ children, onSettled, onSuccess, multiple = false }: UploadMediaProps) => {
  const t = useI18n();
  const { mutateAsync, isPending } = clientApi.media.uploadMedia.useMutation({
    async onSuccess(mediaIds) {
      await onSuccess?.(
        mediaIds.map((id) => ({
          id,
          url: `/api/user-medias/${id}`,
        })),
      );
    },
    async onSettled() {
      await onSettled?.();
    },
  });

  const handleFileUploadAsync = async (files: File[] | File | null) => {
    if (!files || (Array.isArray(files) && files.length === 0)) return;
    const filesArray: File[] = Array.isArray(files) ? files : [files];
    const formData = new FormData();
    filesArray.forEach((file) => formData.append("files", file));
    await mutateAsync(formData, {
      onSuccess() {
        showSuccessNotification({
          message: t("media.action.upload.notification.success.message"),
        });
      },
      onError() {
        showErrorNotification({
          message: t("media.action.upload.notification.error.message"),
        });
      },
    });
  };

  return (
    <FileButton onChange={handleFileUploadAsync} accept={supportedMediaUploadFormats.join(",")} multiple={multiple}>
      {({ onClick }) => children({ onClick, loading: isPending })}
    </FileButton>
  );
};
