import { MantineTheme } from '@mantine/core';
import { createContext, useContext } from 'react';

type colorThemeContextType = {
  primaryColor: MantineTheme['primaryColor'];
  secondaryColor: MantineTheme['primaryColor'];
  primaryShade: MantineTheme['primaryShade'];
  setPrimaryColor: (color: MantineTheme['primaryColor']) => void;
  setSecondaryColor: (color: MantineTheme['primaryColor']) => void;
  setPrimaryShade: (shade: MantineTheme['primaryShade']) => void;
};

export const ColorTheme = createContext<colorThemeContextType>({
  primaryColor: 'red',
  secondaryColor: 'orange',
  primaryShade: 6,
  setPrimaryColor: () => {},
  setSecondaryColor: () => {},
  setPrimaryShade: () => {},
});

export function useColorTheme() {
  const context = useContext(ColorTheme);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorTheme.Provider');
  }
  return context;
}
