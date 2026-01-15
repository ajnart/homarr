"use client";

import { TextInput } from "@mantine/core";

import type { CommonWidgetInputProps } from "./common";
import { useWidgetInputTranslation } from "./common";
import { useFormContext } from "./form";

export const WidgetTextInput = ({ property, kind, options }: CommonWidgetInputProps<"text">) => {
  const t = useWidgetInputTranslation(kind, property);
  const form = useFormContext();

  return (
    <TextInput
      label={t("label")}
      description={options.withDescription ? t("description") : undefined}
      {...form.getInputProps(`options.${property}`)}
    />
  );
};
