"use client";

import type { FocusEventHandler } from "react";
import {
  Anchor,
  Avatar,
  CheckIcon,
  CloseButton,
  Combobox,
  Group,
  Input,
  Pill,
  PillsInput,
  Stack,
  Text,
  useCombobox,
} from "@mantine/core";

import type { IntegrationKind } from "@homarr/definitions";
import { getIconUrl } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

import classes from "./widget-integration-select.module.css";

interface WidgetIntegrationSelectProps {
  label: string;
  onChange: (value: string[]) => void;
  value?: string[];
  error?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  canSelectMultiple?: boolean;
  data: IntegrationSelectOption[];
  withAsterisk?: boolean;
}
export const WidgetIntegrationSelect = ({
  data,
  onChange,
  value: valueProp,
  canSelectMultiple = true,
  withAsterisk = false,
  ...props
}: WidgetIntegrationSelectProps) => {
  const t = useI18n();
  const multiSelectValues = valueProp ?? [];

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (selectedValue: string) => {
    onChange(
      multiSelectValues.includes(selectedValue)
        ? multiSelectValues.filter((value) => value !== selectedValue)
        : [...multiSelectValues, selectedValue],
    );
    if (!canSelectMultiple) {
      combobox.closeDropdown();
    }
  };

  const handleValueRemove = (valueToRemove: string) =>
    onChange(multiSelectValues.filter((value) => value !== valueToRemove));

  const values = multiSelectValues.map((item) => {
    const option = data.find((integration) => integration.id === item);
    if (!option) {
      return null;
    }

    return (
      <IntegrationPill
        key={item}
        option={option}
        onRemove={() => handleValueRemove(item)}
        showRemoveButton={canSelectMultiple}
      />
    );
  });

  const options = data.map((item) => {
    return (
      <Combobox.Option value={item.id} key={item.id} active={multiSelectValues.includes(item.id)}>
        <Group gap="sm" align="center">
          {multiSelectValues.includes(item.id) ? <CheckIcon size={12} /> : null}
          <Group gap={7} align="center">
            <Avatar src={getIconUrl(item.kind)} size="sm" />
            <Stack gap={0}>
              <span>{item.name}</span>
              <Text size="xs" c="gray.6">
                {item.url}
              </Text>
            </Stack>
          </Group>
        </Group>
      </Combobox.Option>
    );
  });

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
      <Combobox.DropdownTarget>
        <PillsInput
          inputWrapperOrder={["label", "input", "description", "error"]}
          description={
            <Text size="xs" span>
              {t.rich("widget.common.integration.description", {
                here: () => (
                  <Anchor size="xs" component={Link} target="_blank" href="/manage/integrations">
                    {t("common.here")}
                  </Anchor>
                ),
              })}
            </Text>
          }
          pointer
          onClick={() => combobox.toggleDropdown()}
          withAsterisk={withAsterisk}
          {...props}
        >
          <Pill.Group>
            {values.length > 0 ? values : <Input.Placeholder>{t("common.multiSelect.placeholder")}</Input.Placeholder>}

            <Combobox.EventsTarget>
              <PillsInput.Field
                type="hidden"
                onBlur={() => combobox.closeDropdown()}
                onKeyDown={(event) => {
                  if (event.key !== "Backspace") return;

                  event.preventDefault();
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  handleValueRemove(multiSelectValues[multiSelectValues.length - 1]!);
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length >= 1 ? (
            options
          ) : (
            <Text p={4} size="sm" ta="center" c="var(--mantine-color-dimmed)">
              {t("widget.common.integration.noData")}
            </Text>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export interface IntegrationSelectOption {
  id: string;
  name: string;
  url: string;
  kind: IntegrationKind;
}

interface IntegrationPillProps {
  option: IntegrationSelectOption;
  onRemove: () => void;
  showRemoveButton: boolean;
}

const IntegrationPill = ({ option, onRemove, showRemoveButton }: IntegrationPillProps) => (
  <Group align="center" wrap="nowrap" gap={0} className={classes.pill} mih={24} pr={!showRemoveButton ? 10 : undefined}>
    <Avatar src={getIconUrl(option.kind)} size={14} mr={6} />
    <Text span size="xs" lh={1} fw={500}>
      {option.name}
    </Text>
    {showRemoveButton && (
      <CloseButton onMouseDown={onRemove} variant="transparent" color="gray" size={22} iconSize={14} tabIndex={-1} />
    )}
  </Group>
);
