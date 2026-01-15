"use client";

import { Button, Group, Stack, Switch } from "@mantine/core";

import { useForm } from "@homarr/form";
import { useI18n } from "@homarr/translation/client";

import type { Board } from "../../_types";
import { useSavePartialSettingsMutation } from "./_shared";

interface Props {
  board: Board;
}

export const BehaviorSettingsContent = ({ board }: Props) => {
  const t = useI18n();
  const { mutate: savePartialSettings, isPending } = useSavePartialSettingsMutation(board);
  const form = useForm({
    initialValues: {
      disableStatus: board.disableStatus,
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        savePartialSettings({
          id: board.id,
          ...values,
        });
      })}
    >
      <Stack>
        <Switch
          label={t("board.field.disableStatus.label")}
          description={t("board.field.disableStatus.description")}
          {...form.getInputProps("disableStatus", { type: "checkbox" })}
        />

        <Group justify="end">
          <Button type="submit" loading={isPending}>
            {t("common.action.saveChanges")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
