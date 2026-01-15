import type { ReactNode } from "react";
import React from "react";
import type { MantineSpacing } from "@mantine/core";
import { Group, Stack, Switch, Text, UnstyledButton } from "@mantine/core";

import type { Modify } from "@homarr/common/types";
import type { UseFormReturnType } from "@homarr/form";

export const SwitchSetting = <TFormValue extends Record<string, boolean>>({
  form,
  ms,
  title,
  text,
  formKey,
  disabled,
}: {
  form: Modify<
    UseFormReturnType<TFormValue, () => TFormValue>,
    {
      setFieldValue: (key: keyof TFormValue, value: (previous: boolean) => boolean) => void;
    }
  >;
  formKey: keyof TFormValue;
  ms?: MantineSpacing;
  title: string;
  text: ReactNode;
  disabled?: boolean;
}) => {
  const handleClick = React.useCallback(() => {
    if (disabled) {
      return;
    }

    form.setFieldValue(formKey, (previous) => !previous);
  }, [form, formKey, disabled]);

  return (
    <Group ms={ms} justify="space-between" gap="lg" align="center" wrap="nowrap">
      <UnstyledButton style={{ flexGrow: 1 }} onClick={handleClick}>
        <Stack gap={0}>
          <Text fw="bold">{title}</Text>
          <Text c="gray.5" fz={{ base: "xs", md: "sm" }}>
            {text}
          </Text>
        </Stack>
      </UnstyledButton>
      <Switch disabled={disabled} onClick={handleClick} checked={form.values[formKey] && !disabled} />
    </Group>
  );
};
