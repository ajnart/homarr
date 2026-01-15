"use client";

import { Button, Group, Stack } from "@mantine/core";
import type { z } from "zod/v4";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { userChangeHomeBoardsSchema } from "@homarr/validation/user";

import type { Board } from "~/app/[locale]/boards/_types";
import { BoardSelect } from "~/components/board/board-select";

interface ChangeHomeBoardFormProps {
  user: RouterOutputs["user"]["getById"];
  boardsData: Pick<Board, "id" | "name" | "logoImageUrl">[];
}

export const ChangeHomeBoardForm = ({ user, boardsData }: ChangeHomeBoardFormProps) => {
  const t = useI18n();
  const { mutate, isPending } = clientApi.user.changeHomeBoards.useMutation({
    async onSettled() {
      await revalidatePathActionAsync(`/manage/users/${user.id}`);
    },
    onSuccess(_, variables) {
      form.setInitialValues({
        homeBoardId: variables.homeBoardId,
        mobileHomeBoardId: variables.mobileHomeBoardId,
      });
      showSuccessNotification({
        message: t("user.action.changeHomeBoard.notification.success.message"),
      });
    },
    onError() {
      showErrorNotification({
        message: t("user.action.changeHomeBoard.notification.error.message"),
      });
    },
  });
  const form = useZodForm(userChangeHomeBoardsSchema, {
    initialValues: {
      homeBoardId: user.homeBoardId,
      mobileHomeBoardId: user.mobileHomeBoardId,
    },
  });

  const handleSubmit = (values: FormType) => {
    mutate({
      userId: user.id,
      ...values,
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <BoardSelect
          label={t("management.page.user.setting.general.item.board.type.general")}
          clearable
          boards={boardsData}
          w="100%"
          {...form.getInputProps("homeBoardId")}
        />
        <BoardSelect
          label={t("management.page.user.setting.general.item.board.type.mobile")}
          clearable
          boards={boardsData}
          w="100%"
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

type FormType = z.infer<typeof userChangeHomeBoardsSchema>;
