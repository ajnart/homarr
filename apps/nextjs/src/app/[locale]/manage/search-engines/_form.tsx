"use client";

import type { SegmentedControlItem } from "@mantine/core";
import { Button, Fieldset, Grid, Group, SegmentedControl, Stack, Textarea, TextInput } from "@mantine/core";
import { WidgetIntegrationSelect } from "node_modules/@homarr/widgets/src/widget-integration-select";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { searchEngineTypes } from "@homarr/definitions";
import { useZodForm } from "@homarr/form";
import { IconPicker } from "@homarr/forms-collection";
import type { TranslationFunction } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";
import { searchEngineManageSchema } from "@homarr/validation/search-engine";

type FormType = z.infer<typeof searchEngineManageSchema>;

interface SearchEngineFormProps {
  submitButtonTranslation: (t: TranslationFunction) => string;
  initialValues?: FormType;
  handleSubmit: (values: FormType) => void;
  isPending: boolean;
  disableShort?: boolean;
}

export const SearchEngineForm = (props: SearchEngineFormProps) => {
  const { submitButtonTranslation, handleSubmit, initialValues, isPending, disableShort } = props;
  const t = useI18n();

  const [integrationData] = clientApi.integration.allThatSupportSearch.useSuspenseQuery();

  const form = useZodForm(searchEngineManageSchema, {
    initialValues: initialValues ?? {
      name: "",
      short: "",
      iconUrl: "",
      urlTemplate: "",
      description: "",
      type: "generic",
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8, lg: 9, xl: 10 }}>
            <TextInput {...form.getInputProps("name")} withAsterisk label={t("search.engine.field.name.label")} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4, lg: 3, xl: 2 }}>
            <TextInput
              {...form.getInputProps("short")}
              disabled={disableShort}
              withAsterisk
              label={t("search.engine.field.short.label")}
            />
          </Grid.Col>
        </Grid>
        <IconPicker {...form.getInputProps("iconUrl")} />

        <Fieldset legend={t("search.engine.page.edit.configControl")}>
          <SegmentedControl
            data={searchEngineTypes.map(
              (type) =>
                ({
                  label: t(`search.engine.page.edit.searchEngineType.${type}`),
                  value: type,
                }) satisfies SegmentedControlItem,
            )}
            {...form.getInputProps("type")}
            fullWidth
          />

          {form.values.type === "generic" && (
            <TextInput
              {...form.getInputProps("urlTemplate")}
              withAsterisk
              label={t("search.engine.field.urlTemplate.label")}
            />
          )}

          {form.values.type === "fromIntegration" && (
            <WidgetIntegrationSelect
              label="Integration"
              data={integrationData}
              canSelectMultiple={false}
              onChange={(value) => form.setFieldValue("integrationId", value[0])}
              value={form.values.integrationId !== undefined ? [form.values.integrationId] : []}
              withAsterisk
            />
          )}
        </Fieldset>

        <Textarea {...form.getInputProps("description")} label={t("search.engine.field.description.label")} />

        <Group justify="end">
          <Button variant="default" component={Link} href="/manage/search-engines">
            {t("common.action.backToOverview")}
          </Button>
          <Button type="submit" loading={isPending}>
            {submitButtonTranslation(t)}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
