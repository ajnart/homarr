"use client";

import { Button, Group, Stack, TextInput } from "@mantine/core";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { useZodForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";
import { boardRenameSchema } from "@homarr/validation/board";

interface InnerProps {
  id: string;
  previousName: string;
  onSuccess?: (name: string) => void;
}

export const BoardRenameModal = createModal<InnerProps>(({ actions, innerProps }) => {
  const utils = clientApi.useUtils();
  const t = useI18n();
  const { mutate, isPending } = clientApi.board.renameBoard.useMutation({
    onSettled() {
      void utils.board.getBoardByName.invalidate({
        name: innerProps.previousName,
      });
      void utils.board.getHomeBoard.invalidate();
    },
  });
  const form = useZodForm(boardRenameSchema.omit({ id: true }), {
    initialValues: {
      name: innerProps.previousName,
    },
  });

  const handleSubmit = (values: FormType) => {
    mutate(
      {
        id: innerProps.id,
        name: values.name,
      },
      {
        onSuccess: () => {
          actions.closeModal();
          innerProps.onSuccess?.(values.name);
        },
      },
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label={t("board.field.name.label")} {...form.getInputProps("name")} data-autofocus />
        <Group justify="end">
          <Button variant="subtle" color="gray" onClick={actions.closeModal}>
            {t("common.action.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("common.action.confirm")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle: (t) => t("board.setting.section.dangerZone.action.rename.modal.title"),
});

type FormType = Omit<z.infer<typeof boardRenameSchema>, "id">;
