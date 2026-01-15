"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";

interface DeleteMediaProps {
  media: RouterOutputs["media"]["getPaginated"]["items"][number];
}

export const DeleteMedia = ({ media }: DeleteMediaProps) => {
  const { openConfirmModal } = useConfirmModal();
  const t = useI18n();
  const { mutateAsync, isPending } = clientApi.media.deleteMedia.useMutation();

  const onClick = () => {
    openConfirmModal({
      title: t("media.action.delete.label"),
      children: t.rich("media.action.delete.description", { bName: () => <b>{media.name}</b> }),
      // eslint-disable-next-line no-restricted-syntax
      onConfirm: async () => {
        await mutateAsync({ id: media.id });
        await revalidatePathActionAsync("/manage/medias");
      },
    });
  };

  return (
    <Tooltip label={t("media.action.delete.label")} openDelay={500}>
      <ActionIcon color="red" variant="subtle" onClick={onClick} loading={isPending}>
        <IconTrash color="red" size={16} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
};
