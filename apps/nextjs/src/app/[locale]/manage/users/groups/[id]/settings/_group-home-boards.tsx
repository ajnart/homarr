"use client";

import { Button, Group, Stack } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { groupSettingsSchema } from "@homarr/validation/group";

import { BoardSelect } from "~/components/board/board-select";

interface GroupHomeBoardsProps {
  homeBoardId: string | null;
  mobileHomeBoardId: string | null;
  groupId: string;
}

export const GroupHomeBoards = ({ homeBoardId, mobileHomeBoardId, groupId }: GroupHomeBoardsProps) => {
  const t = useI18n();
  const [availableBoards] = clientApi.board.getBoardsForGroup.useSuspenseQuery({ groupId });
  const form = useZodForm(groupSettingsSchema.pick({ homeBoardId: true, mobileHomeBoardId: true }), {
    initialValues: {
      homeBoardId,
      mobileHomeBoardId,
    },
  });
  const { mutateAsync, isPending } = clientApi.group.savePartialSettings.useMutation();

  const handleSubmit = form.onSubmit(async (values) => {
    await mutateAsync(
      {
        id: groupId,
        settings: values,
      },
      {
        onSuccess() {
          form.setInitialValues(values);
          showSuccessNotification({
            title: t("group.action.settings.board.notification.success.title"),
            message: t("group.action.settings.board.notification.success.message"),
          });
        },
        onError() {
          showErrorNotification({
            title: t("group.action.settings.board.notification.error.title"),
            message: t("group.action.settings.board.notification.error.message"),
          });
        },
      },
    );
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <BoardSelect
          label={t("group.field.homeBoard.label")}
          description={t("group.field.homeBoard.description")}
          clearable
          boards={availableBoards}
          {...form.getInputProps("homeBoardId")}
        />

        <BoardSelect
          label={t("group.field.mobileBoard.label")}
          description={t("group.field.mobileBoard.description")}
          clearable
          boards={availableBoards}
          {...form.getInputProps("mobileHomeBoardId")}
        />

        <Group justify="end">
          <Button type="submit" loading={isPending}>
            {t("common.action.save")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
