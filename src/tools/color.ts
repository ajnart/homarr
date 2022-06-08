import { createContext, useContext } from 'react';

type colorThemeContextType = {
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
};

export const ColorTheme = createContext<colorThemeContextType>({
  primaryColor: 'red',
  secondaryColor: 'orange',
  setPrimaryColor: () => {},
  setSecondaryColor: () => {},
});

export function useColorTheme() {
  const context = useContext(ColorTheme);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorTheme.Provider');
  }
  return context;
}
