"use client";

import type { FocusEventHandler } from "react";
import { useState } from "react";
import { Combobox, Group, Pill, PillsInput, Text, useCombobox } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { useI18n } from "@homarr/translation/client";

interface TextMultiSelectProps {
  label: string;
  value?: string[];
  onChange: (value: string[]) => void;
  onFocus?: FocusEventHandler;
  onBlur?: FocusEventHandler;
  error?: string;
}

export const TextMultiSelect = ({ label, value = [], onChange, onBlur, onFocus, error }: TextMultiSelectProps) => {
  const t = useI18n();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");

  const exactOptionMatch = value.some((item) => item === search);

  const handleValueSelect = (selectedValue: string) => {
    setSearch("");

    if (selectedValue === "$create") {
      onChange([...value, search]);
    } else {
      onChange(value.filter((filterValue) => filterValue !== selectedValue));
    }
  };

  const handleValueRemove = (removedValue: string) =>
    onChange(value.filter((filterValue) => filterValue !== removedValue));

  const values = value.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {item}
    </Pill>
  ));

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
      <Combobox.DropdownTarget>
        <PillsInput label={label} error={error} onClick={() => combobox.openDropdown()}>
          <Pill.Group>
            {values}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={(event) => {
                  onFocus?.(event);
                  combobox.openDropdown();
                }}
                onBlur={(event) => {
                  onBlur?.(event);
                  combobox.closeDropdown();
                }}
                value={search}
                placeholder={t("common.multiText.placeholder")}
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    handleValueRemove(value.at(-1)!);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      {!exactOptionMatch && search.trim().length > 0 && (
        <Combobox.Dropdown>
          <Combobox.Options>
            <Combobox.Option value="$create">
              <Group>
                <IconPlus size={12} />
                <Text size="sm">{t("common.multiText.addLabel", { value: search })}</Text>
              </Group>
            </Combobox.Option>
          </Combobox.Options>
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
};
