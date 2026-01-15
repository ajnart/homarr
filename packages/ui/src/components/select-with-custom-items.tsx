"use client";

import { useCallback, useMemo } from "react";
import type { SelectProps } from "@mantine/core";
import { Combobox, ComboboxClearButton, Input, InputBase, useCombobox } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";

interface BaseSelectItem {
  value: string;
  label: string;
}

export interface SelectWithCustomItemsProps<TSelectItem extends BaseSelectItem> extends Pick<
  SelectProps,
  "label" | "error" | "defaultValue" | "value" | "onChange" | "placeholder" | "clearable"
> {
  data: TSelectItem[];
  description?: string;
  withAsterisk?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  w?: string;
}

type Props<TSelectItem extends BaseSelectItem> = SelectWithCustomItemsProps<TSelectItem> & {
  SelectOption: React.ComponentType<TSelectItem>;
};

export const SelectWithCustomItems = <TSelectItem extends BaseSelectItem>({
  data,
  onChange,
  value,
  defaultValue,
  placeholder,
  SelectOption,
  w,
  clearable,
  ...props
}: Props<TSelectItem>) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange,
  });

  const selectedOption = useMemo(() => data.find((item) => item.value === _value), [data, _value]);

  const options = data.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      <SelectOption {...item} />
    </Combobox.Option>
  ));

  const toggle = useCallback(() => combobox.toggleDropdown(), [combobox]);
  const onOptionSubmit = useCallback(
    (value: string) => {
      setValue(
        value,
        data.find((item) => item.value === value),
      );
      combobox.closeDropdown();
    },
    [setValue, data, combobox],
  );

  const _clearable = clearable && Boolean(_value);

  return (
    <Combobox store={combobox} withinPortal={false} onOptionSubmit={onOptionSubmit}>
      <Combobox.Target>
        <InputBase
          {...props}
          component="button"
          type="button"
          pointer
          __clearSection={<ComboboxClearButton onClear={() => setValue(null, null)} />}
          __clearable={_clearable}
          __defaultRightSection={<Combobox.Chevron />}
          onClick={toggle}
          rightSectionPointerEvents={_clearable ? "all" : "none"}
          multiline
          w={w}
        >
          {selectedOption ? <SelectOption {...selectedOption} /> : <Input.Placeholder>{placeholder}</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
