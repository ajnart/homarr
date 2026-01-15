"use client";

import { NumberInput } from "@mantine/core";

import type { CommonWidgetInputProps } from "./common";
import { useWidgetInputTranslation } from "./common";
import { useFormContext } from "./form";

export const WidgetNumberInput = ({ property, kind, options }: CommonWidgetInputProps<"number">) => {
  const t = useWidgetInputTranslation(kind, property);
  const form = useFormContext();

  return (
    <NumberInput
      label={t("label")}
      description={options.withDescription ? t("description") : undefined}
      min={options.validate.minValue ?? undefined}
      max={options.validate.maxValue ?? undefined}
      step={options.step}
      {...form.getInputProps(`options.${property}`)}
    />
  );
};
