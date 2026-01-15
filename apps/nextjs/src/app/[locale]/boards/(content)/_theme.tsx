"use client";

import type { PropsWithChildren } from "react";
import type { MantineColorsTuple } from "@mantine/core";
import { colorsTuple, createTheme, darken, lighten, MantineProvider, rem } from "@mantine/core";

import { useRequiredBoard } from "@homarr/boards/context";
import type { ColorScheme } from "@homarr/definitions";

import { useColorSchemeManager } from "../../_client-providers/mantine";

export const BoardMantineProvider = ({
  children,
  defaultColorScheme,
}: PropsWithChildren<{ defaultColorScheme: ColorScheme }>) => {
  const board = useRequiredBoard();
  const colorSchemeManager = useColorSchemeManager();

  const theme = createTheme({
    colors: {
      primaryColor: generateColors(board.primaryColor),
      secondaryColor: generateColors(board.secondaryColor),
      iconColor: board.iconColor ? generateColors(board.iconColor) : colorsTuple("#000000"),
    },
    primaryColor: "primaryColor",
    autoContrast: true,
    fontSizes: {
      "2xl": rem(24),
      "3xl": rem(28),
      "4xl": rem(36),
    },
  });

  return (
    <MantineProvider defaultColorScheme={defaultColorScheme} theme={theme} colorSchemeManager={colorSchemeManager}>
      {children}
    </MantineProvider>
  );
};

export const generateColors = (hex: string) => {
  const lightnessForColors = [-0.25, -0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2] as const;
  const rgbaColors = lightnessForColors.map((lightness) => {
    if (lightness < 0) {
      return lighten(hex, -lightness);
    }
    return darken(hex, lightness);
  });

  return rgbaColors.map((color) => {
    return (
      "#" +
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color
        .split("(")[1]!
        .replaceAll(" ", "")
        .replace(")", "")
        .split(",")
        .map((color) => parseInt(color, 10))
        .slice(0, 3)
        .map((color) => color.toString(16).padStart(2, "0"))
        .join("")
    );
  }) as unknown as MantineColorsTuple;
};
