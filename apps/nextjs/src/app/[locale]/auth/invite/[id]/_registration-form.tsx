"use client";

import { useRouter } from "next/navigation";
import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useScopedI18n } from "@homarr/translation/client";
import { CustomPasswordInput } from "@homarr/ui";
import { userRegistrationSchema } from "@homarr/validation/user";

interface RegistrationFormProps {
  invite: {
    id: string;
    token: string;
  };
}

export const RegistrationForm = ({ invite }: RegistrationFormProps) => {
  const t = useScopedI18n("user");
  const router = useRouter();
  const { mutate, isPending } = clientApi.user.register.useMutation();
  const form = useZodForm(userRegistrationSchema, {
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof userRegistrationSchema>) => {
    mutate(
      {
        ...values,
        inviteId: invite.id,
        token: invite.token,
      },
      {
        onSuccess() {
          showSuccessNotification({
            title: t("action.register.notification.success.title"),
            message: t("action.register.notification.success.message"),
          });
          router.push("/auth/login");
        },
        onError(error) {
          const message =
            error.data?.code === "CONFLICT"
              ? t("error.usernameTaken")
              : t("action.register.notification.error.message");

          showErrorNotification({
            title: t("action.register.notification.error.title"),
            message,
          });
        },
      },
    );
  };

  return (
    <Stack gap="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput
            label={t("field.username.label")}
            id="username"
            autoComplete="username"
            {...form.getInputProps("username")}
          />
          <CustomPasswordInput
            withPasswordRequirements
            label={t("field.password.label")}
            id="password"
            autoComplete="new-password"
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label={t("field.passwordConfirm.label")}
            id="password-confirm"
            autoComplete="new-password"
            {...form.getInputProps("confirmPassword")}
          />
          <Button type="submit" fullWidth loading={isPending}>
            {t("action.register.label")}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
