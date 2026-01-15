"use client";

import type { MantineColor } from "@mantine/core";
import { Badge, Group, Text } from "@mantine/core";

import type { SelectWithCustomItemsProps } from "./select-with-custom-items";
import { SelectWithCustomItems } from "./select-with-custom-items";

export interface SelectItemWithDescriptionBadge {
  value: string;
  label: string;
  badge?: { label: string; color: MantineColor };
  description: string;
}
type Props = SelectWithCustomItemsProps<SelectItemWithDescriptionBadge>;

export const SelectWithDescriptionBadge = (props: Props) => {
  return <SelectWithCustomItems<SelectItemWithDescriptionBadge> {...props} SelectOption={SelectOption} />;
};

const SelectOption = ({ label, description, badge }: SelectItemWithDescriptionBadge) => {
  return (
    <Group justify="space-between">
      <div>
        <Text fz="sm" fw={500}>
          {label}
        </Text>
        <Text fz="xs" opacity={0.6}>
          {description}
        </Text>
      </div>

      {badge && (
        <Badge color={badge.color} variant="outline" size="sm">
          {badge.label}
        </Badge>
      )}
    </Group>
  );
};
