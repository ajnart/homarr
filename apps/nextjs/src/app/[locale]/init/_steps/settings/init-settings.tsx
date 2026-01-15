"use client";

import { startTransition } from "react";
import { Button, Card, Group, Stack, Switch, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import type { CheckboxProps } from "@homarr/form/types";
import { defaultServerSettings } from "@homarr/server-settings";
import type { TranslationObject } from "@homarr/translation";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import { settingsInitSchema } from "@homarr/validation/settings";

export const InitSettings = () => {
  const tSection = useScopedI18n("management.page.settings.section");
  const t = useI18n();
  const { mutateAsync } = clientApi.serverSettings.initSettings.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/init");
    },
  });
  const form = useZodForm(settingsInitSchema, { initialValues: defaultServerSettings });

  form.watch("analytics.enableGeneral", ({ value }) => {
    if (!value) {
      startTransition(() => {
        form.setFieldValue("analytics.enableWidgetData", false);
        form.setFieldValue("analytics.enableIntegrationData", false);
        form.setFieldValue("analytics.enableUserData", false);
      });
    }
  });

  const handleSubmitAsync = async (values: z.infer<typeof settingsInitSchema>) => {
    await mutateAsync(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmitAsync)}>
      <Stack>
        <Card w={64 * 12 + 8} maw="90vw" withBorder>
          <Stack gap="sm">
            <Text fw={500}>{tSection("analytics.title")}</Text>

            <Stack gap="xs">
              <AnalyticsRow kind="general" {...form.getInputProps("analytics.enableGeneral", { type: "checkbox" })} />

              <Stack gap="xs" ps="md" w="100%">
                <AnalyticsRow
                  kind="integrationData"
                  disabled={!form.values.analytics.enableGeneral}
                  {...form.getInputProps("analytics.enableWidgetData", { type: "checkbox" })}
                />
                <AnalyticsRow
                  kind="widgetData"
                  disabled={!form.values.analytics.enableGeneral}
                  {...form.getInputProps("analytics.enableIntegrationData", { type: "checkbox" })}
                />
                <AnalyticsRow
                  kind="usersData"
                  disabled={!form.values.analytics.enableGeneral}
                  {...form.getInputProps("analytics.enableUserData", { type: "checkbox" })}
                />
              </Stack>
            </Stack>
          </Stack>
        </Card>
        <Card w={64 * 12 + 8} maw="90vw" withBorder>
          <Stack gap="sm">
            <Text fw={500}>{tSection("crawlingAndIndexing.title")}</Text>

            <Stack gap="xs">
              <CrawlingRow
                kind="noIndex"
                {...form.getInputProps("crawlingAndIndexing.noIndex", { type: "checkbox" })}
              />
              <CrawlingRow
                kind="noFollow"
                {...form.getInputProps("crawlingAndIndexing.noFollow", { type: "checkbox" })}
              />
              <CrawlingRow
                kind="noTranslate"
                {...form.getInputProps("crawlingAndIndexing.noTranslate", { type: "checkbox" })}
              />
              <CrawlingRow
                kind="noSiteLinksSearchBox"
                {...form.getInputProps("crawlingAndIndexing.noSiteLinksSearchBox", { type: "checkbox" })}
              />
            </Stack>
          </Stack>
        </Card>

        <Button type="submit" loading={form.submitting} rightSection={<IconArrowRight size={16} stroke={1.5} />}>
          {t("common.action.continue")}
        </Button>
      </Stack>
    </form>
  );
};

interface AnalyticsRowProps {
  kind: Exclude<keyof TranslationObject["management"]["page"]["settings"]["section"]["analytics"], "title">;
  disabled?: boolean;
}

const AnalyticsRow = ({ kind, ...props }: AnalyticsRowProps & CheckboxProps) => {
  const tSection = useI18n("management.page.settings.section");

  return (
    <SettingRow title={tSection(`analytics.${kind}.title`)} text={tSection(`analytics.${kind}.text`)} {...props} />
  );
};

interface CrawlingRowProps {
  kind: Exclude<
    keyof TranslationObject["management"]["page"]["settings"]["section"]["crawlingAndIndexing"],
    "title" | "warning"
  >;
}

const CrawlingRow = ({ kind, ...inputProps }: CrawlingRowProps & CheckboxProps) => {
  const tSection = useI18n("management.page.settings.section");

  return (
    <SettingRow
      title={tSection(`crawlingAndIndexing.${kind}.title`)}
      text={tSection(`crawlingAndIndexing.${kind}.text`)}
      {...inputProps}
    />
  );
};

const SettingRow = ({
  title,
  text,
  disabled,
  ...inputProps
}: { title: string; text: string; disabled?: boolean } & CheckboxProps) => {
  return (
    <Group wrap="nowrap" align="center">
      <Stack gap={0} style={{ flex: 1 }}>
        <Text size="sm" fw={500}>
          {title}
        </Text>
        <Text size="xs" c="gray.5">
          {text}
        </Text>
      </Stack>

      <Switch disabled={disabled} {...inputProps} />
    </Group>
  );
};
