"use client";

import { Group, Select } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import { translateIfNecessary } from "@homarr/translation";
import type { stringOrTranslation } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";

import type { CommonWidgetInputProps } from "./common";
import { useWidgetInputTranslation } from "./common";
import { useFormContext } from "./form";

export type SelectOption =
  | {
      icon?: TablerIcon;
      value: string;
      label: stringOrTranslation;
    }
  | string;

export type inferSelectOptionValue<TOption extends SelectOption> = TOption extends {
  value: infer TValue;
}
  ? TValue
  : TOption;

const getIconFor = (options: SelectOption[], value: string) => {
  const current = options.find((option) => (typeof option === "string" ? option : option.value) === value);
  if (!current) return null;
  if (typeof current === "string") return null;
  return current.icon;
};

export const WidgetSelectInput = ({ property, kind, options }: CommonWidgetInputProps<"select">) => {
  const t = useI18n();
  const tWidget = useWidgetInputTranslation(kind, property);
  const form = useFormContext();
  const inputProps = form.getInputProps(`options.${property}`);
  const CurrentIcon = getIconFor(options.options, inputProps.value as string);

  return (
    <Select
      label={tWidget("label")}
      data={options.options.map((option) =>
        typeof option === "string"
          ? option
          : {
              value: option.value,
              label: translateIfNecessary(t, option.label) ?? option.value,
            },
      )}
      leftSection={CurrentIcon && <CurrentIcon size={16} stroke={1.5} />}
      renderOption={({ option, checked }) => {
        const Icon = getIconFor(options.options, option.value);

        return (
          <Group flex="1" gap="xs">
            {Icon && <Icon color="currentColor" opacity={0.6} size={18} stroke={1.5} />}
            {option.label}
            {checked && (
              <IconCheck
                style={{ marginInlineStart: "auto" }}
                color="currentColor"
                opacity={0.6}
                size={18}
                stroke={1.5}
              />
            )}
          </Group>
        );
      }}
      description={options.withDescription ? tWidget("description") : undefined}
      searchable={options.searchable}
      {...inputProps}
    />
  );
};
