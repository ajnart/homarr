import { ColorScheme, useMantineTheme } from '@mantine/core';
import { isToday } from '~/tools/shared/time/date.tool';

export const getBgColorByDateAndTheme = (colorScheme: ColorScheme, date: Date) => {
  if (!isToday(date)) {
    return undefined;
  }

  const { colors } = useMantineTheme();

  if (colorScheme === 'dark') {
    return colors.dark[5];
  }

  return colors.gray[2];
};
