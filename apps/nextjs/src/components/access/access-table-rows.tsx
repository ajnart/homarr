import type { ReactNode } from "react";
import { useCallback } from "react";
import type { SelectProps } from "@mantine/core";
import { Button, Flex, Group, Select, TableTd, TableTr, Text } from "@mantine/core";
import { Icon123, IconCheck } from "@tabler/icons-react";

import { useI18n } from "@homarr/translation/client";

import { useAccessContext } from "./context";
import type { HandleCountChange } from "./form";
import { useFormContext } from "./form";

interface AccessSelectRowProps {
  itemContent: ReactNode;
  permission: string;
  index: number;
  handleCountChange: HandleCountChange;
}

export const AccessSelectRow = ({ itemContent, permission, index, handleCountChange }: AccessSelectRowProps) => {
  const tRoot = useI18n();
  const { icons, getSelectData } = useAccessContext();
  const form = useFormContext();

  const handleRemove = useCallback(() => {
    form.setFieldValue(
      "items",
      form.values.items.filter((_, i) => i !== index),
    );
    handleCountChange((prev) => prev - 1);
  }, [form, index, handleCountChange]);

  const Icon = icons[permission] ?? Icon123;

  return (
    <TableTr>
      <TableTd w={{ sm: 128, lg: 256 }}>{itemContent}</TableTd>
      <TableTd>
        <Flex direction={{ base: "column", xs: "row" }} align={{ base: "end", xs: "center" }} wrap="nowrap">
          <Select
            allowDeselect={false}
            flex="1"
            leftSection={<Icon size="1rem" />}
            renderOption={RenderOption}
            variant="unstyled"
            data={getSelectData()}
            {...form.getInputProps(`items.${index}.permission`)}
          />

          <Button size="xs" variant="subtle" onClick={handleRemove}>
            {tRoot("common.action.remove")}
          </Button>
        </Flex>
      </TableTd>
    </TableTr>
  );
};

const iconProps = {
  stroke: 1.5,
  color: "currentColor",
  opacity: 0.6,
  size: "1rem",
};

const RenderOption: SelectProps["renderOption"] = ({ option, checked }) => {
  const { icons } = useAccessContext();

  const Icon = icons[option.value] ?? Icon123;
  return (
    <Group flex="1" gap="xs" wrap="nowrap">
      <Icon {...iconProps} />
      {option.label}
      {checked && <IconCheck style={{ marginInlineStart: "auto" }} {...iconProps} />}
    </Group>
  );
};

interface AccessDisplayRowProps {
  itemContent: ReactNode;
  permission: string;
}

export const AccessDisplayRow = ({ itemContent, permission }: AccessDisplayRowProps) => {
  const { icons, translate } = useAccessContext();
  const Icon = icons[permission] ?? Icon123;

  return (
    <TableTr>
      <TableTd w={{ sm: 128, lg: 256 }}>{itemContent}</TableTd>
      <TableTd>
        <Group gap={0}>
          <Flex w={34} h={34} align="center" justify="center">
            <Icon size="1rem" color="var(--input-section-color, var(--mantine-color-dimmed))" />
          </Flex>
          <Text size="sm">{translate(permission)}</Text>
        </Group>
      </TableTd>
    </TableTr>
  );
};
