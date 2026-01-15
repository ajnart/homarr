import type { DefaultMantineColor, MantineColorShade } from "@mantine/core";
import { DEFAULT_THEME } from "@mantine/core";

export const getMantineColor = (color: DefaultMantineColor, shade: MantineColorShade) =>
  DEFAULT_THEME.colors[color]?.[shade] ?? "#fff";
