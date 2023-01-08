import { MantineSize, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export const useScreenSmallerThan = (size: MantineSize | number) => {
  const { breakpoints } = useMantineTheme();
  const pixelCount = typeof size === 'string' ? breakpoints[size] : size;
  return useMediaQuery(`(max-width: ${pixelCount}px)`);
};
