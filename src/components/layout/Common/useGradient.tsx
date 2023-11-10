import { MantineGradient } from '@mantine/core';
import { useColorTheme } from '~/tools/color';

export const usePrimaryGradient = () => {
  const { primaryColor, secondaryColor } = useColorTheme();

  return {
    from: primaryColor,
    to: secondaryColor,
    deg: 145,
  } satisfies MantineGradient;
};
