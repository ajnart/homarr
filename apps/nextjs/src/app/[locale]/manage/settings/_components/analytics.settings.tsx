"use client";

import React from "react";
import { Card, LoadingOverlay, Stack, Title } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useForm } from "@homarr/form";
import type { defaultServerSettings } from "@homarr/server-settings";
import { useScopedI18n } from "@homarr/translation/client";

import { SwitchSetting } from "~/app/[locale]/manage/settings/_components/setting-switch";

interface AnalyticsSettingsProps {
  initialData: typeof defaultServerSettings.analytics;
}

export const AnalyticsSettings = ({ initialData }: AnalyticsSettingsProps) => {
  const t = useScopedI18n("management.page.settings.section.analytics");
  const form = useForm({
    initialValues: initialData,
    onValuesChange: (updatedValues, _) => {
      if (!form.isValid()) {
        return;
      }

      if (
        !updatedValues.enableGeneral &&
        (updatedValues.enableWidgetData || updatedValues.enableIntegrationData || updatedValues.enableUserData)
      ) {
        updatedValues.enableIntegrationData = false;
        updatedValues.enableUserData = false;
        updatedValues.enableWidgetData = false;
      }

      void mutateAsync({
        settingsKey: "analytics",
        value: updatedValues,
      });
    },
  });

  const { mutateAsync, isPending } = clientApi.serverSettings.saveSettings.useMutation({
    onSettled: async () => {
      await revalidatePathActionAsync("/manage/settings");
    },
  });

  return (
    <>
      <Title order={2}>{t("title")}</Title>

      <Card pos="relative" withBorder>
        <LoadingOverlay visible={isPending} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Stack>
          <SwitchSetting form={form} formKey="enableGeneral" title={t("general.title")} text={t("general.text")} />
          <SwitchSetting
            form={form}
            formKey="enableIntegrationData"
            ms="xl"
            title={t("integrationData.title")}
            text={t("integrationData.text")}
            disabled={!form.values.enableGeneral}
          />
          <SwitchSetting
            form={form}
            formKey="enableWidgetData"
            ms="xl"
            title={t("widgetData.title")}
            text={t("widgetData.text")}
            disabled={!form.values.enableGeneral}
          />
          <SwitchSetting
            form={form}
            formKey="enableUserData"
            ms="xl"
            title={t("usersData.title")}
            text={t("usersData.text")}
            disabled={!form.values.enableGeneral}
          />
        </Stack>
      </Card>
    </>
  );
};
