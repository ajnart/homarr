import React, { useState } from "react";
import { Combobox, Pill, PillsInput, useCombobox } from "@mantine/core";

import { useScopedI18n } from "@homarr/translation/client";

import type { CommonWidgetInputProps } from "./common";
import { useWidgetInputTranslation } from "./common";
import { useFormContext } from "./form";

export const WidgetMultiTextInput = ({ property, kind, options }: CommonWidgetInputProps<"multiText">) => {
  const t = useWidgetInputTranslation(kind, property);
  const tCommon = useScopedI18n("common");
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");

  const form = useFormContext();
  const inputProps = form.getInputProps(`options.${property}`);
  const values = inputProps.value as string[];
  const onChange = inputProps.onChange as (values: string[]) => void;

  const handleRemove = (optionIndex: number) => {
    onChange(values.filter((_, index) => index !== optionIndex));
  };

  const currentValidationResult = React.useMemo(() => {
    if (!options.validate) {
      return {
        success: false,
        result: null,
      };
    }

    const validationResult = options.validate.safeParse(search);
    return {
      success: validationResult.success,
      result: validationResult,
    };
  }, [options.validate, search]);

  const error = React.useMemo(() => {
    /* hide the error when nothing is being typed since "" is not valid but is not an explicit error */
    if (!currentValidationResult.success && currentValidationResult.result && search.length !== 0) {
      return currentValidationResult.result.error?.issues[0]?.message;
    }
    return null;
  }, [currentValidationResult, search]);

  const handleAddSearch = () => {
    if (search.length === 0 || !currentValidationResult.success) {
      return;
    }
    if (values.includes(search)) {
      return;
    }
    onChange([...values, search]);
    setSearch("");
  };

  return (
    <Combobox store={combobox}>
      <Combobox.DropdownTarget>
        <PillsInput
          label={t("label")}
          description={options.withDescription ? t("description") : undefined}
          onClick={() => combobox.openDropdown()}
          error={error}
        >
          <Pill.Group>
            {values.map((option, index) => (
              <Pill key={option} onRemove={() => handleRemove(index)} withRemoveButton>
                {option}
              </Pill>
            ))}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => {
                  handleAddSearch();
                  combobox.closeDropdown();
                }}
                value={search}
                placeholder={tCommon("multiText.placeholder")}
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    onChange(values.slice(0, -1));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddSearch();
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>
    </Combobox>
  );
};
