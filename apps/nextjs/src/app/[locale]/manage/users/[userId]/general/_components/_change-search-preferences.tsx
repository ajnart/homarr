"use client";

import { Button, Group, Select, Stack, Switch } from "@mantine/core";
import type { z } from "zod/v4";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { userChangeSearchPreferencesSchema } from "@homarr/validation/user";

interface ChangeSearchPreferencesFormProps {
  user: RouterOutputs["user"]["getById"];
  searchEnginesData: { value: string; label: string }[];
}

export const ChangeSearchPreferencesForm = ({ user, searchEnginesData }: ChangeSearchPreferencesFormProps) => {
  const t = useI18n();
  const { mutate, isPending } = clientApi.user.changeSearchPreferences.useMutation({
    async onSettled() {
      await revalidatePathActionAsync(`/manage/users/${user.id}`);
    },
    onSuccess(_, variables) {
      form.setInitialValues({
        defaultSearchEngineId: variables.defaultSearchEngineId,
        openInNewTab: variables.openInNewTab,
      });
      showSuccessNotification({
        message: t("user.action.changeSearchPreferences.notification.success.message"),
      });
    },
    onError() {
      showErrorNotification({
        message: t("user.action.changeSearchPreferences.notification.error.message"),
      });
    },
  });
  const form = useZodForm(userChangeSearchPreferencesSchema, {
    initialValues: {
      defaultSearchEngineId: user.defaultSearchEngineId,
      openInNewTab: user.openSearchInNewTab,
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
        <Select
          label={t("user.field.defaultSearchEngine.label")}
          w="100%"
          data={searchEnginesData}
          {...form.getInputProps("defaultSearchEngineId")}
        />
        <Switch
          label={t("user.field.openSearchInNewTab.label")}
          {...form.getInputProps("openInNewTab", { type: "checkbox" })}
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

type FormType = z.infer<typeof userChangeSearchPreferencesSchema>;
