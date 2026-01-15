"use client";

import { Group, Text, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

import type { ColorScheme } from "@homarr/definitions";
import { colorSchemes } from "@homarr/definitions";
import { useScopedI18n } from "@homarr/translation/client";
import { SelectWithCustomItems } from "@homarr/ui";

interface CurrentColorSchemeComboboxProps {
  w?: string;
}

export const CurrentColorSchemeCombobox = ({ w }: CurrentColorSchemeComboboxProps) => {
  const tOptions = useScopedI18n("common.colorScheme.options");
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SelectWithCustomItems
      value={colorScheme}
      onChange={(value) => setColorScheme((value as ColorScheme | null) ?? "light")}
      data={colorSchemes.map((scheme) => ({
        value: scheme,
        label: tOptions(scheme),
      }))}
      SelectOption={ColorSchemeCustomOption}
      w={w}
    />
  );
};

const appearanceIcons = {
  light: IconSun,
  dark: IconMoon,
};

const ColorSchemeCustomOption = ({ value, label }: { value: ColorScheme; label: string }) => {
  const Icon = appearanceIcons[value];

  return (
    <Group>
      <Icon size={16} stroke={1.5} />
      <Text fz="sm" fw={500}>
        {label}
      </Text>
    </Group>
  );
};
