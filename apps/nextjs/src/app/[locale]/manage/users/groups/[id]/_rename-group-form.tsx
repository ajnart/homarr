"use client";

import { useCallback } from "react";
import { Button, Group, Stack, TextInput } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { groupUpdateSchema } from "@homarr/validation/group";

interface RenameGroupFormProps {
  group: {
    id: string;
    name: string;
  };
  disabled?: boolean;
}

export const RenameGroupForm = ({ group, disabled }: RenameGroupFormProps) => {
  const t = useI18n();
  const { mutate, isPending } = clientApi.group.updateGroup.useMutation();
  const form = useZodForm(groupUpdateSchema.pick({ name: true }), {
    initialValues: {
      name: group.name,
    },
  });

  const handleSubmit = useCallback(
    (values: FormType) => {
      if (disabled) {
        return;
      }
      mutate(
        {
          ...values,
          id: group.id,
        },
        {
          onSuccess() {
            void revalidatePathActionAsync(`/users/groups/${group.id}`);
            showSuccessNotification({
              title: t("common.notification.update.success"),
              message: t("group.action.update.notification.success.message", {
                name: values.name,
              }),
            });
          },
          onError() {
            showErrorNotification({
              title: t("common.notification.update.error"),
              message: t("group.action.update.notification.error.message", {
                name: values.name,
              }),
            });
          },
        },
      );
    },
    [group.id, mutate, t, disabled],
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label={t("group.field.name")} {...form.getInputProps("name")} disabled={disabled} />

        {!disabled && (
          <Group justify="end">
            <Button type="submit" loading={isPending}>
              {t("common.action.saveChanges")}
            </Button>
          </Group>
        )}
      </Stack>
    </form>
  );
};

interface FormType {
  name: string;
}
