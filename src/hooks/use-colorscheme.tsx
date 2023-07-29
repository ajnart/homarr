import { ColorScheme as MantineColorScheme } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { setCookie } from 'cookies-next';
import { Session } from 'next-auth';
import { createContext, useContext, useState } from 'react';
import { api } from '~/utils/api';

import { COOKIE_COLOR_SCHEME_KEY } from '../../data/constants';

export type ColorScheme = 'dark' | 'light' | 'environment';

export const ColorSchemeContext = createContext<{
  colorScheme: MantineColorScheme;
  settings: ColorScheme;
  toggleColorScheme: () => Promise<void>;
  setColorScheme: (colorScheme: ColorScheme) => void;
} | null>(null);

type ColorSchemeProviderProps = {
  activeColorScheme: ColorScheme;
  environmentColorScheme: MantineColorScheme;
  session: Session;
  children: (colorScheme: MantineColorScheme) => React.ReactNode;
};

export const ColorSchemeProvider = ({
  activeColorScheme,
  environmentColorScheme,
  session,
  children,
}: ColorSchemeProviderProps) => {
  const [colorScheme, setColorScheme] = useState(activeColorScheme);
  const { mutateAsync } = api.user.changeColorScheme.useMutation();

  const toggleColorScheme = async () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newColorScheme);
    setCookie(COOKIE_COLOR_SCHEME_KEY, newColorScheme);
    if (session && new Date(session.expires) > new Date()) {
      await mutateAsync({ colorScheme: newColorScheme });
    }
  };

  const changeColorScheme = (colorScheme: ColorScheme) => setColorScheme(colorScheme);

  useHotkeys([['mod+J', () => void toggleColorScheme()]]);

  const mantineColorScheme = colorScheme === 'environment' ? environmentColorScheme : colorScheme;

  return (
    <ColorSchemeContext.Provider
      value={{
        colorScheme: mantineColorScheme,
        settings: colorScheme,
        toggleColorScheme,
        setColorScheme: changeColorScheme,
      }}
    >
      {children(mantineColorScheme)}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
};
