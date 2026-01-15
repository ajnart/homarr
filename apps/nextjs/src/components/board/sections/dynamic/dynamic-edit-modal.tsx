"use client";

import { Button, CloseButton, ColorInput, Group, Stack, TextInput, useMantineTheme } from "@mantine/core";
import type { z } from "zod/v4";

import { useZodForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";
import { TextMultiSelect } from "@homarr/ui";
import { dynamicSectionOptionsSchema } from "@homarr/validation/shared";

interface ModalProps {
  value: z.infer<typeof dynamicSectionOptionsSchema>;
  onSuccessfulEdit: (value: z.infer<typeof dynamicSectionOptionsSchema>) => void;
}

export const DynamicSectionEditModal = createModal<ModalProps>(({ actions, innerProps }) => {
  const t = useI18n();
  const theme = useMantineTheme();

  const form = useZodForm(dynamicSectionOptionsSchema, {
    mode: "controlled",
    initialValues: { ...innerProps.value },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        innerProps.onSuccessfulEdit(values);
        actions.closeModal();
      })}
    >
      <Stack>
        <TextInput label={t("section.dynamic.option.title.label")} {...form.getInputProps("title")} />
        <TextMultiSelect
          label={t("section.dynamic.option.customCssClasses.label")}
          {...form.getInputProps("customCssClasses")}
        />
        <ColorInput
          label={t("section.dynamic.option.borderColor.label")}
          format="hex"
          swatches={Object.values(theme.colors).map((color) => color[6])}
          rightSection={
            <CloseButton
              onClick={() => form.setFieldValue("borderColor", "")}
              style={{ display: form.getInputProps("borderColor").value ? undefined : "none" }}
            />
          }
          {...form.getInputProps("borderColor")}
        />
        <Group justify="end">
          <Group justify="end" w={{ base: "100%", xs: "auto" }}>
            <Button onClick={actions.closeModal} variant="subtle" color="gray">
              {t("common.action.cancel")}
            </Button>
            <Button type="submit">{t("common.action.saveChanges")}</Button>
          </Group>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle(t) {
    return t("item.edit.title");
  },
  size: "lg",
});
