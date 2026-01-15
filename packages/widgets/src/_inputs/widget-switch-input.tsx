"use client";

import { Switch } from "@mantine/core";

import type { CommonWidgetInputProps } from "./common";
import { useWidgetInputTranslation } from "./common";
import { useFormContext } from "./form";

export const WidgetSwitchInput = ({ property, kind, options }: CommonWidgetInputProps<"switch">) => {
  const t = useWidgetInputTranslation(kind, property);
  const form = useFormContext();

  return (
    <Switch
      label={t("label")}
      description={options.withDescription ? t("description") : undefined}
      {...form.getInputProps(`options.${property}`, { type: "checkbox" })}
    />
  );
};
