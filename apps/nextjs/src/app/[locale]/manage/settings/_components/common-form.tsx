"use client";

import { Button, Group, Stack } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { useForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import type { ServerSettings } from "@homarr/server-settings";
import { useI18n, useScopedI18n } from "@homarr/translation/client";

export const CommonSettingsForm = <TKey extends keyof ServerSettings>({
  settingKey,
  defaultValues,
  children,
}: {
  settingKey: TKey;
  defaultValues: ServerSettings[TKey];
  children: (form: ReturnType<typeof useForm<ServerSettings[TKey]>>) => React.ReactNode;
}) => {
  const t = useI18n();
  const tSettings = useScopedI18n("management.page.settings");
  const { mutateAsync, isPending } = clientApi.serverSettings.saveSettings.useMutation({
    onSuccess() {
      showSuccessNotification({
        message: tSettings("notification.success.message"),
      });
    },
    onError() {
      showErrorNotification({
        message: tSettings("notification.error.message"),
      });
    },
  });
  const form = useForm({
    initialValues: defaultValues,
  });

  const handleSubmitAsync = async (values: ServerSettings[TKey]) => {
    await mutateAsync({
      settingsKey: settingKey,
      value: values,
    });
  };

  return (
    <form onSubmit={form.onSubmit((values) => void handleSubmitAsync(values))}>
      <Stack gap="sm">
        {children(form)}
        <Group justify="end">
          <Button type="submit" loading={isPending}>
            {t("common.action.save")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
