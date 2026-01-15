"use client";

import React from "react";
import { Card, LoadingOverlay, Stack, Text, Title } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useForm } from "@homarr/form";
import type { defaultServerSettings } from "@homarr/server-settings";
import { useScopedI18n } from "@homarr/translation/client";

import { SwitchSetting } from "~/app/[locale]/manage/settings/_components/setting-switch";

interface CrawlingAndIndexingSettingsProps {
  initialData: typeof defaultServerSettings.crawlingAndIndexing;
}

export const CrawlingAndIndexingSettings = ({ initialData }: CrawlingAndIndexingSettingsProps) => {
  const t = useScopedI18n("management.page.settings.section.crawlingAndIndexing");
  const form = useForm({
    initialValues: initialData,
    onValuesChange: (updatedValues, _) => {
      if (!form.isValid()) {
        return;
      }

      void mutateAsync({
        settingsKey: "crawlingAndIndexing",
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
        <Text c={"dimmed"} mb={"lg"}>
          {t("warning")}
        </Text>
        <LoadingOverlay visible={isPending} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Stack>
          <SwitchSetting form={form} formKey="noIndex" title={t("noIndex.title")} text={t("noIndex.text")} />
          <SwitchSetting form={form} formKey="noFollow" title={t("noFollow.title")} text={t("noFollow.text")} />
          <SwitchSetting
            form={form}
            formKey="noTranslate"
            title={t("noTranslate.title")}
            text={t("noTranslate.text")}
          />
          <SwitchSetting
            form={form}
            formKey="noSiteLinksSearchBox"
            title={t("noSiteLinksSearchBox.title")}
            text={t("noSiteLinksSearchBox.text")}
          />
        </Stack>
      </Card>
    </>
  );
};
