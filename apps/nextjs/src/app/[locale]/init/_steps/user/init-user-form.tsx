"use client";

import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { signIn } from "@homarr/auth/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useScopedI18n } from "@homarr/translation/client";
import { CustomPasswordInput } from "@homarr/ui";
import { userInitSchema } from "@homarr/validation/user";

export const InitUserForm = () => {
  const t = useScopedI18n("user");
  const tUser = useScopedI18n("init.step.user");
  const { mutateAsync, isPending } = clientApi.user.initUser.useMutation();
  const form = useZodForm(userInitSchema, {
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmitAsync = async (values: FormType) => {
    await mutateAsync(values, {
      onSuccess() {
        showSuccessNotification({
          title: tUser("notification.success.title"),
          message: tUser("notification.success.message"),
        });

        void signIn("credentials", {
          name: values.username,
          password: values.password,
          redirect: false,
        }).then(async () => {
          await revalidatePathActionAsync("/init");
        });
      },
      onError: (error) => {
        showErrorNotification({
          title: tUser("notification.error.title"),
          message: error.message,
        });
      },
    });
  };

  return (
    <Stack gap="xl">
      <form
        onSubmit={form.onSubmit(
          (values) => void handleSubmitAsync(values),
          (err) => console.log(err),
        )}
      >
        <Stack gap="lg">
          <TextInput label={t("field.username.label")} {...form.getInputProps("username")} />
          <CustomPasswordInput
            withPasswordRequirements
            label={t("field.password.label")}
            {...form.getInputProps("password")}
          />
          <PasswordInput label={t("field.passwordConfirm.label")} {...form.getInputProps("confirmPassword")} />
          <Button type="submit" fullWidth loading={isPending}>
            {t("action.create")}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

type FormType = z.infer<typeof userInitSchema>;
