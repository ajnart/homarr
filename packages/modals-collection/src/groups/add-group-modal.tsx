import { Button, Group, Stack, TextInput } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { groupCreateSchema } from "@homarr/validation/group";

export const AddGroupModal = createModal<void>(({ actions }) => {
  const t = useI18n();
  const { mutate, isPending } = clientApi.group.createGroup.useMutation();
  const form = useZodForm(groupCreateSchema, {
    initialValues: {
      name: "",
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        mutate(values, {
          onSuccess() {
            actions.closeModal();
            void revalidatePathActionAsync("/manage/users/groups");
            showSuccessNotification({
              title: t("common.notification.create.success"),
              message: t("group.action.create.notification.success.message"),
            });
          },
          onError() {
            showErrorNotification({
              title: t("common.notification.create.error"),
              message: t("group.action.create.notification.error.message"),
            });
          },
        });
      })}
    >
      <Stack>
        <TextInput label={t("group.field.name")} data-autofocus {...form.getInputProps("name")} />
        <Group justify="right">
          <Button onClick={actions.closeModal} variant="subtle" color="gray">
            {t("common.action.cancel")}
          </Button>
          <Button loading={isPending} type="submit">
            {t("common.action.create")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle: (t) => t("group.action.create.label"),
});
