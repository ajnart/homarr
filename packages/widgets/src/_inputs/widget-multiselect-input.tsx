"use client";

import { MultiSelect } from "@mantine/core";

import { translateIfNecessary } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";

import type { CommonWidgetInputProps } from "./common";
import { useWidgetInputTranslation } from "./common";
import { useFormContext } from "./form";

export const WidgetMultiSelectInput = ({ property, kind, options }: CommonWidgetInputProps<"multiSelect">) => {
  const t = useI18n();
  const tWidget = useWidgetInputTranslation(kind, property);
  const form = useFormContext();

  return (
    <MultiSelect
      label={tWidget("label")}
      data={options.options.map((option) =>
        typeof option === "string"
          ? option
          : {
              value: option.value,
              label: translateIfNecessary(t, option.label) ?? option.value,
            },
      )}
      description={options.withDescription ? tWidget("description") : undefined}
      searchable={options.searchable}
      {...form.getInputProps(`options.${property}`)}
    />
  );
};
