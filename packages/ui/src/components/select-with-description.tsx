"use client";

import { Text } from "@mantine/core";

import type { SelectWithCustomItemsProps } from "./select-with-custom-items";
import { SelectWithCustomItems } from "./select-with-custom-items";

export interface SelectItemWithDescription {
  value: string;
  label: string;
  description: string;
}
type Props = SelectWithCustomItemsProps<SelectItemWithDescription>;

export const SelectWithDescription = (props: Props) => {
  return <SelectWithCustomItems<SelectItemWithDescription> {...props} SelectOption={SelectOption} />;
};

const SelectOption = ({ label, description }: SelectItemWithDescription) => {
  return (
    <div>
      <Text fz="sm" fw={500}>
        {label}
      </Text>
      <Text fz="xs" opacity={0.6}>
        {description}
      </Text>
    </div>
  );
};
