"use client";

import { Button, Group, InputWrapper, Slider, Stack } from "@mantine/core";

import { useForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";

interface InnerProps {
  dimensions: Dimensions;
  setDimensions: (dimensions: Dimensions) => void;
}

export const PreviewDimensionsModal = createModal<InnerProps>(({ actions, innerProps }) => {
  const t = useI18n();
  const form = useForm({
    initialValues: innerProps.dimensions,
  });

  const handleSubmit = (values: Dimensions) => {
    innerProps.setDimensions(values);
    actions.closeModal();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <InputWrapper label={t("item.moveResize.field.width.label")}>
          <Slider min={64} max={1024} step={64} {...form.getInputProps("width")} />
        </InputWrapper>
        <InputWrapper label={t("item.moveResize.field.height.label")}>
          <Slider min={64} max={1024} step={64} {...form.getInputProps("height")} />
        </InputWrapper>
        <Group justify="end">
          <Button variant="subtle" color="gray" onClick={actions.closeModal}>
            {t("common.action.cancel")}
          </Button>
          <Button type="submit">{t("common.action.confirm")}</Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle: (t) => t("widgetPreview.dimensions.title"),
});

export interface Dimensions {
  width: number;
  height: number;
}
