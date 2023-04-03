import { MantineSize, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MIN_WIDTH_MOBILE } from '../constants/constants';

export const useScreenLargerThan = (size: MantineSize | number) => {
  const { breakpoints } = useMantineTheme();
  const pixelCount = typeof size === 'string' ? breakpoints[size] : size;
  return useMediaQuery(`(min-width: ${MIN_WIDTH_MOBILE})`);
};
