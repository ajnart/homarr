import { useMantineTheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { createTss } from 'tss-react';

function useContext() {
  // You can return anything here, you decide what's the context.
  const colorScheme = useColorScheme();
  const theme = useMantineTheme();
  return { theme, colorScheme };
}

export const { tss } = createTss({ useContext });

export const useStyles = tss.create({});
