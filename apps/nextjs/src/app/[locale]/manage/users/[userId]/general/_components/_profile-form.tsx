"use client";

import { useCallback } from "react";
import { Button, Group, Stack, TextInput } from "@mantine/core";

import type { RouterInputs, RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { userEditProfileSchema } from "@homarr/validation/user";

interface UserProfileFormProps {
  user: RouterOutputs["user"]["getById"];
}

export const UserProfileForm = ({ user }: UserProfileFormProps) => {
  const t = useI18n();
  const { mutate, isPending } = clientApi.user.editProfile.useMutation({
    async onSettled() {
      await revalidatePathActionAsync("/manage/users");
    },
    onSuccess(_, variables) {
      // Reset form initial values to reset dirty state
      form.setInitialValues({
        name: variables.name,
        email: variables.email ?? "",
      });
      showSuccessNotification({
        title: t("common.notification.update.success"),
        message: t("user.action.editProfile.notification.success.message"),
      });
    },
    onError(error) {
      const message =
        error.data?.code === "CONFLICT"
          ? t("user.error.usernameTaken")
          : t("user.action.editProfile.notification.error.message");
      showErrorNotification({
        title: t("common.notification.update.error"),
        message,
      });
    },
  });
  const form = useZodForm(userEditProfileSchema.omit({ id: true }), {
    initialValues: {
      name: user.name ?? "",
      email: user.email ?? "",
    },
  });

  // Only credentials users can edit their profile
  const isProviderCredentials = user.provider === "credentials";

  const handleSubmit = useCallback(
    (values: FormType) => {
      if (!isProviderCredentials) return;
      mutate({
        ...values,
        id: user.id,
      });
    },
    [isProviderCredentials, mutate, user.id],
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          disabled={!isProviderCredentials}
          label={t("user.field.username.label")}
          withAsterisk
          {...form.getInputProps("name")}
        />
        <TextInput
          disabled={!isProviderCredentials}
          label={t("user.field.email.label")}
          {...form.getInputProps("email")}
        />

        {isProviderCredentials && (
          <Group justify="end">
            <Button type="submit" disabled={!form.isDirty()} loading={isPending}>
              {t("common.action.saveChanges")}
            </Button>
          </Group>
        )}
      </Stack>
    </form>
  );
};

type FormType = Omit<RouterInputs["user"]["editProfile"], "id">;
